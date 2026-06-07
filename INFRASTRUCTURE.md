# Infraestructura Serverless – Tarea 2 Paralelo

## Arquitectura

```
Mobile App
    │
    ▼
API Gateway (HTTP API v2)
    │
    ▼
AWS Lambda (Node.js 18 – Express + serverless-express)
    │
    ├──► Neon PostgreSQL (Base de datos cloud)
    └──► S3 Bucket (Archivos / uploads)
         │
         └──► URL pública para la app móvil

GitHub → GitHub Actions → Terraform Apply → AWS
```

## Recursos AWS creados por Terraform

| Recurso | Nombre | Descripción |
|---------|--------|-------------|
| `aws_s3_bucket` | `app-felix-uploads-production` | Almacenamiento de archivos subidos |
| `aws_iam_role` | `app-felix-lambda-role-production` | Rol de ejecución Lambda |
| `aws_lambda_function` | `app-felix-api-production` | Función Lambda (Express app) |
| `aws_apigatewayv2_api` | `app-felix-api-gw-production` | HTTP API Gateway |
| `aws_cloudwatch_log_group` | `/aws/lambda/app-felix-api-production` | Logs (30 días) |

## GitHub Secrets requeridos

Configurar en **Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Clave de acceso IAM |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta IAM |
| `AWS_REGION` | Región (ej: `us-east-1`) |
| `DATABASE_URL` | Connection string de Neon/Supabase |
| `JWT_SECRET` | Clave secreta para JWT |

## Base de datos cloud – Neon PostgreSQL

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear un nuevo proyecto/database
3. Copiar el connection string (formato: `postgresql://user:pass@host/db?sslmode=require`)
4. Agregar como `DATABASE_URL` en GitHub Secrets

## Pipeline CI/CD

El workflow `.github/workflows/deploy.yml` ejecuta:

```
push a main
    │
    ├── Job 1: Build & Test
    │   ├── npm ci
    │   ├── npm test
    │   └── zip -r lambda.zip src/ node_modules/ ...
    │
    ├── Job 2: Terraform
    │   ├── terraform init
    │   ├── terraform validate
    │   ├── terraform plan
    │   └── terraform apply -auto-approve
    │
    └── Job 3: Deploy Lambda
        └── aws lambda update-function-code --zip-file lambda.zip
```

## Despliegue manual (primera vez)

```bash
# 1. Instalar dependencias del backend
cd backend
npm ci

# 2. Crear el ZIP de Lambda
zip -r lambda.zip src/ node_modules/ package.json

# 3. Inicializar Terraform
cd ../terraform
terraform init

# 4. Plan (reemplazar con tus valores reales)
terraform plan \
  -var="database_url=postgresql://..." \
  -var="jwt_secret=tu_secret_aqui"

# 5. Apply
terraform apply -auto-approve \
  -var="database_url=postgresql://..." \
  -var="jwt_secret=tu_secret_aqui"

# 6. Ver URL de la API
terraform output api_gateway_url
```

## Actualizar la app móvil

Tras el despliegue, obtener la URL base del API Gateway:

```bash
cd terraform
terraform output api_gateway_url
# Ej: https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

Actualizar en la app móvil la constante `BASE_URL` o variable de entorno con esa URL.
