# ============================================================
#  outputs.tf – Valores exportados tras el apply
# ============================================================

output "api_gateway_url" {
  description = "URL base de la API (API Gateway → Lambda)"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda desplegada"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "ARN de la función Lambda"
  value       = aws_lambda_function.api.arn
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 para uploads"
  value       = aws_s3_bucket.uploads.bucket
}

output "s3_bucket_domain" {
  description = "Dominio público del bucket S3"
  value       = aws_s3_bucket.uploads.bucket_regional_domain_name
}

output "cloudwatch_log_group" {
  description = "Grupo de logs de CloudWatch"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "health_check_url" {
  description = "Endpoint de health check de la API"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/health"
}

output "sns_topic_arn" {
  description = "ARN del SNS Topic de notificaciones"
  value       = aws_sns_topic.notifications.arn
}

output "sqs_queue_url" {
  description = "URL de la SQS Queue de notificaciones"
  value       = aws_sqs_queue.notifications.id
}

output "notification_lambda_name" {
  description = "Nombre de la Lambda de notificaciones"
  value       = aws_lambda_function.notification.function_name
}

output "notification_lambda_log_group" {
  description = "CloudWatch log group de notification-lambda"
  value       = aws_cloudwatch_log_group.notification_lambda_logs.name
}
