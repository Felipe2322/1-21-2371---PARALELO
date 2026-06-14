# -------------------------------------------------------
# terraform.tfvars  –  Valores de configuración del proyecto
# -------------------------------------------------------
# IMPORTANTE: Este archivo NO se sube a GitHub.
# Los valores sensibles (database_url, jwt_secret) se
# inyectan automáticamente desde GitHub Secrets en CI/CD.
# -------------------------------------------------------

aws_region    = "us-east-1"
project_name  = "app-felix"
environment   = "production"

lambda_runtime = "nodejs18.x"
lambda_memory  = 512
lambda_timeout = 30

jwt_expires_in = "7d"

ses_from_email = "felixacabreragaro@gmail.com"

# Dejar vacío para generar nombre automático, o definir uno:
# s3_uploads_bucket = "app-felix-uploads-prod"
s3_uploads_bucket = ""

# NO incluir aquí:
# database_url = "..."   <-- viene de GitHub Secret TF_VAR_database_url
# jwt_secret   = "..."   <-- viene de GitHub Secret TF_VAR_jwt_secret
