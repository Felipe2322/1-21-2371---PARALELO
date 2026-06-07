# ============================================================
#  main.tf – Infraestructura Serverless para la aplicación
#  Recursos: S3, IAM Role, Lambda, API Gateway (HTTP API)
#            CloudWatch Log Group
# ============================================================

# ------------------------------------------------------------
# S3 – Almacenamiento de archivos subidos por los usuarios
# ------------------------------------------------------------
locals {
  bucket_name = var.s3_uploads_bucket != "" ? var.s3_uploads_bucket : "${var.project_name}-uploads-${var.environment}"
}

resource "aws_s3_bucket" "uploads" {
  bucket        = local.bucket_name
  force_destroy = false

  tags = {
    Name = "${var.project_name}-uploads"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Política que permite acceso público de lectura (GET) a los objetos
resource "aws_s3_bucket_policy" "uploads_public_read" {
  bucket     = aws_s3_bucket.uploads.id
  depends_on = [aws_s3_bucket_public_access_block.uploads]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.uploads.arn}/uploads/*"
      }
    ]
  })
}

# ------------------------------------------------------------
# CloudWatch – Grupo de logs para Lambda
# ------------------------------------------------------------
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-api-${var.environment}"
  retention_in_days = 30
}

# ------------------------------------------------------------
# IAM – Rol de ejecución de Lambda
# ------------------------------------------------------------
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

# Política básica de ejecución (logs)
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Política custom: acceso al bucket S3 de uploads
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${var.project_name}-lambda-s3-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}

# ------------------------------------------------------------
# Lambda – Función principal (Express app envuelta en serverless-express)
# ------------------------------------------------------------
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api-${var.environment}"
  description   = "API REST – Felix Cabrera – Tarea 2 Paralelo"

  role    = aws_iam_role.lambda_exec.arn
  runtime = var.lambda_runtime

  # El archivo ZIP es generado por el pipeline de CI/CD
  filename         = "${path.module}/../backend/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/lambda.zip")

  handler = "src/lambda.handler"

  memory_size = var.lambda_memory
  timeout     = var.lambda_timeout

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs,
    aws_iam_role_policy_attachment.lambda_basic,
  ]

  environment {
    variables = {
      NODE_ENV       = "production"
      DATABASE_URL   = var.database_url
      JWT_SECRET     = var.jwt_secret
      JWT_EXPIRES_IN = var.jwt_expires_in
      S3_BUCKET      = aws_s3_bucket.uploads.bucket
      AWS_S3_REGION  = var.aws_region
      UPLOAD_DIR     = "uploads"
    }
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

# ------------------------------------------------------------
# API Gateway – HTTP API (v2, más barato y simple que REST)
# ------------------------------------------------------------
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-api-gw-${var.environment}"
  protocol_type = "HTTP"
  description   = "HTTP API Gateway para ${var.project_name}"

  cors_configuration {
    allow_origins  = ["*"]
    allow_methods  = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    allow_headers  = ["Content-Type", "Authorization", "X-Requested-With"]
    expose_headers = ["Content-Type"]
    max_age        = 3600
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Captura todas las rutas y las delega a Lambda
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.lambda_logs.arn
    format          = "$context.requestId $context.status $context.routeKey $context.integrationErrorMessage"
  }
}

# Permiso para que API Gateway invoque Lambda
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
