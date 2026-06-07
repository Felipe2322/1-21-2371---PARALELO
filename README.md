# Aplicación Mobile - Felix Antonio Cabrera Garo
## React Native + Node.js API + Docker

---

## Arquitectura MVVM

```
mobile/src/
├── models/          → Entidades y DTOs (User, FileUpload, AppConfig)
├── services/        → HTTP requests con Axios (auth, user, upload, profile, config)
├── repositories/    → Abstracción de acceso a datos (AuthRepo, UserRepo, UploadRepo, DashboardRepo)
├── viewmodels/      → Lógica y estados con React Hooks (useAuthViewModel, useUserViewModel, etc.)
├── views/           → Pantallas UI (Login, Register, Dashboard, Users, Upload, Profile)
├── navigation/      → Configuración de navegación
└── context/         → AuthContext global
```

---

## Requerimiento de Paralelismo / Concurrencia

**Implementado con `Promise.all()` en `DashboardRepository.js`:**

```javascript
// Carga 4 endpoints SIMULTÁNEAMENTE
const [usersData, profile, config, files] = await Promise.all([
  UserService.getUsers({ limit: 5 }),    // → GET /api/users
  ProfileService.getProfile(),            // → GET /api/profile
  ConfigService.getConfig(),              // → GET /api/config
  UploadService.getFiles(),               // → GET /api/upload
]);
```

Esto reduce el tiempo de carga del dashboard significativamente al ejecutar todas las peticiones en paralelo en lugar de secuencialmente.

---

## Estructura del Proyecto

```
/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── upload.controller.js
│   │   │   ├── profile.controller.js
│   │   │   └── config.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    (JWT)
│   │   │   └── upload.middleware.js  (Multer)
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── FileUpload.js
│   │   ├── routes/
│   │   └── index.js
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── models/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── viewmodels/
│   │   ├── views/
│   │   ├── navigation/
│   │   └── context/
│   ├── App.js
│   └── package.json
└── docker-compose.yml
```

---

## Endpoints de la API

| Método | Endpoint            | Descripción                    | Auth |
|--------|---------------------|--------------------------------|------|
| POST   | /api/auth/register  | Registrar usuario              | No   |
| POST   | /api/auth/login     | Iniciar sesión (JWT)           | No   |
| GET    | /api/auth/me        | Usuario autenticado            | Sí   |
| GET    | /api/users          | Listar usuarios (paginado)     | Sí   |
| GET    | /api/users/:id      | Obtener usuario por ID         | Sí   |
| POST   | /api/users          | Crear usuario                  | Admin|
| PUT    | /api/users/:id      | Actualizar usuario             | Sí   |
| DELETE | /api/users/:id      | Eliminar usuario               | Admin|
| GET    | /api/profile        | Ver perfil propio              | Sí   |
| PUT    | /api/profile        | Actualizar perfil              | Sí   |
| PUT    | /api/profile/password | Cambiar contraseña           | Sí   |
| POST   | /api/upload         | **Subir archivo**              | Sí   |
| GET    | /api/upload         | Listar archivos del usuario    | Sí   |
| DELETE | /api/upload/:id     | Eliminar archivo               | Sí   |
| GET    | /api/config         | Configuración de la app        | Sí   |
| GET    | /health             | Health check                   | No   |

---

## Instrucciones de Ejecución

### 1. Levantar el Backend con Docker

```bash
# Desde la raíz del proyecto
docker-compose up --build -d

# Verificar que los contenedores estén corriendo
docker-compose ps

# Ver logs
docker-compose logs -f api
```

El backend estará disponible en: `http://localhost:3000`

### 2. Configurar la URL de la API en la app mobile

Editar `mobile/src/services/api.service.js`:

```javascript
// Para emulador Android
const BASE_URL = 'http://10.0.2.2:3000/api';

// Para dispositivo físico (reemplazar con tu IP local)
const BASE_URL = 'http://192.168.1.X:3000/api';

// Para iOS Simulator
const BASE_URL = 'http://localhost:3000/api';
```

### 3. Instalar dependencias y ejecutar la app

```bash
cd mobile
npm install
npx expo start
```

Luego escanear el QR con la app **Expo Go** o presionar:
- `a` para Android emulator
- `i` para iOS simulator

---

## Funcionalidades Implementadas

### ✅ Autenticación JWT
- Login y registro con validación
- Token almacenado en AsyncStorage
- Interceptor Axios que adjunta el token automáticamente
- Manejo de token expirado (limpia sesión automáticamente)

### ✅ CRUD de Usuarios
- Listar con paginación y búsqueda
- Crear usuario con validación
- Editar usuario (nombre, email, contraseña, rol, estado)
- Eliminar usuario (soft delete)

### ✅ Paralelismo con Promise.all()
- Dashboard carga 4 endpoints simultáneamente
- Muestra el tiempo de carga en ms
- Implementado en `DashboardRepository.loadDashboardData()`

### ✅ Subida de Archivos
- Selección desde galería, cámara o documentos
- Preview de imagen/documento antes de subir
- Upload mediante `multipart/form-data`
- Indicador de progreso (0-100%)
- Listado y eliminación de archivos subidos

### ✅ Arquitectura MVVM
- **View**: Pantallas UI (LoginScreen, DashboardScreen, etc.)
- **ViewModel**: Hooks con lógica y estados (useAuthViewModel, etc.)
- **Repository**: Abstracción de datos (AuthRepository, UserRepository, etc.)
- **Services**: HTTP requests con Axios
- **Models**: Entidades y DTOs (User, FileUpload, etc.)

### ✅ Docker
- `Dockerfile` multi-stage para el backend
- `docker-compose.yml` con API + PostgreSQL
- Health checks configurados
- Volúmenes persistentes para DB y uploads

---

## Credenciales de prueba

Crear un usuario admin con:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456","role":"admin"}'
```

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo |
| Navegación | React Navigation v6 |
| HTTP | Axios |
| Storage | AsyncStorage |
| Archivos | expo-image-picker, expo-document-picker |
| Backend | Node.js + Express |
| ORM | Sequelize |
| Base de datos | PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Upload | Multer |
| Docker | Docker + Docker Compose |
