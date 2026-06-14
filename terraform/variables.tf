variable "aws_region" {
  description = "Región de AWS donde se despliega la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto (usado como prefijo en recursos)"
  type        = string
  default     = "app-felix"
}

variable "environment" {
  description = "Entorno de despliegue"
  type        = string
  default     = "production"
}

variable "lambda_runtime" {
  description = "Runtime de Node.js para Lambda"
  type        = string
  default     = "nodejs18.x"
}

variable "lambda_memory" {
  description = "Memoria asignada a la función Lambda (MB)"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Timeout de la función Lambda (segundos)"
  type        = number
  default     = 30
}

variable "database_url" {
  description = "Connection string de PostgreSQL (Neon / Supabase / RDS)"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Clave secreta para firmar los JWT"
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "Duración de los JWT"
  type        = string
  default     = "7d"
}

variable "s3_uploads_bucket" {
  description = "Nombre del bucket S3 para uploads (vacío = auto-generado)"
  type        = string
  default     = ""
}

variable "ses_from_email" {
  description = "Email verificado en SES usado como remitente"
  type        = string
  default     = "no-reply@felixcabrera.dev"
}
