# Urban Complex - Sistema de Gestión de Escuela de Danza

Sistema web completo para gestionar una escuela de danza, permitiendo a los estudiantes reservar clases y a los administradores gestionar toda la operación.

## 🎯 Características

### Para Estudiantes:
- ✅ Registro e inicio de sesión
- ✅ Ver horario completo de clases
- ✅ Reservar clases disponibles
- ✅ Ver historial de clases reservadas
- ✅ Cancelar reservas
- ✅ Gestión de perfil personal
- ✅ Sistema de pagos integrado con Stripe

### Para Administradores:
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de estudiantes
- ✅ Visualización de todas las reservas
- ✅ Control de asistencia
- ✅ Gestión de pagos (manual y online)
- ✅ Reportes de ingresos
- ✅ Gestión de clases (CRUD completo)

## 🛠️ Tecnologías Utilizadas

### Backend:
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT para autenticación
- Stripe para procesamiento de pagos
- bcryptjs para encriptación de contraseñas

### Frontend:
- React 18
- React Router v6
- Axios para peticiones HTTP
- Stripe React para pagos
- CSS3 moderno

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (v14 o superior)
- npm o yarn
- MongoDB (local o cuenta en MongoDB Atlas)
- Cuenta de Stripe (para pagos)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
cd urban-complex-web
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta backend con las siguientes variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urban-complex
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion
STRIPE_SECRET_KEY=sk_test_tu_clave_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
NODE_ENV=development
```

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en la carpeta frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_de_stripe
```

### 4. Iniciar MongoDB

Si tienes MongoDB instalado localmente:

```bash
mongod
```

O usa MongoDB Atlas (cloud) y actualiza el `MONGODB_URI` en el archivo .env del backend.

### 5. Poblar la Base de Datos con Datos Iniciales

Puedes crear un usuario administrador manualmente:

```bash
cd backend
node
```

En la consola de Node:

```javascript
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

async function createAdmin() {
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'Urban Complex',
    email: 'admin@urbancomplex.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-0000'
  });
  console.log('Admin creado:', admin);
  process.exit();
}

createAdmin();
```

### 6. Iniciar la Aplicación

En una terminal (Backend):
```bash
cd backend
npm run dev
```

En otra terminal (Frontend):
```bash
cd frontend
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📚 Estructura del Proyecto

```
urban-complex-web/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── classController.js
│   │   │   ├── paymentController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Class.js
│   │   │   ├── Booking.js
│   │   │   └── Payment.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── bookings.js
│   │   │   ├── classes.js
│   │   │   ├── payments.js
│   │   │   └── users.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   │   └── styles/
    │   │       └── App.css
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── PrivateRoute.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Schedule.js
    │   │   ├── MyBookings.js
    │   │   └── AdminDashboard.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .env
```

## 🔐 Roles y Permisos

### Estudiante (student):
- Ver horarios
- Reservar clases
- Cancelar sus reservas
- Ver su historial
- Gestionar su perfil
- Realizar pagos

### Administrador (admin):
- Todo lo del estudiante +
- Ver todos los estudiantes
- Ver todas las reservas
- Gestionar clases
- Controlar asistencia
- Ver estadísticas
- Gestionar pagos

## 💳 Configuración de Stripe

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves API (test mode)
3. Configura las claves en los archivos .env
4. Para webhooks:
   - Usa Stripe CLI en desarrollo: `stripe listen --forward-to localhost:5000/api/payments/webhook`
   - En producción: configura el webhook en el dashboard de Stripe

## 🎨 Personalización

### Cambiar Colores:
Edita las variables CSS en `frontend/src/assets/styles/App.css`:

```css
:root {
  --primary-color: #ff4757;  /* Color principal */
  --secondary-color: #2ed573;  /* Color secundario */
  --dark-bg: #1e272e;  /* Fondo oscuro */
  /* ... más variables ... */
}
```

### Agregar Nuevas Disciplinas:
Edita el modelo Class en `backend/src/models/Class.js` y agrega las nuevas disciplinas al enum.

## 📱 API Endpoints

### Autenticación
- POST `/api/auth/register` - Registrar usuario
- POST `/api/auth/login` - Iniciar sesión
- GET `/api/auth/me` - Obtener perfil
- PUT `/api/auth/updateprofile` - Actualizar perfil
- PUT `/api/auth/updatepassword` - Cambiar contraseña

### Clases
- GET `/api/classes` - Listar clases
- GET `/api/classes/:id` - Obtener clase
- GET `/api/classes/schedule/weekly` - Horario semanal
- POST `/api/classes` - Crear clase (Admin)
- PUT `/api/classes/:id` - Actualizar clase (Admin)
- DELETE `/api/classes/:id` - Eliminar clase (Admin)

### Reservas
- POST `/api/bookings` - Crear reserva
- GET `/api/bookings/my-bookings` - Mis reservas
- GET `/api/bookings` - Todas las reservas (Admin)
- GET `/api/bookings/:id` - Obtener reserva
- PUT `/api/bookings/:id/cancel` - Cancelar reserva
- PUT `/api/bookings/:id/attendance` - Marcar asistencia (Admin)

### Pagos
- POST `/api/payments/create-intent` - Crear intención de pago
- POST `/api/payments/:id/confirm` - Confirmar pago
- GET `/api/payments/my-payments` - Mis pagos
- GET `/api/payments` - Todos los pagos (Admin)
- POST `/api/payments/manual` - Registrar pago manual (Admin)

### Usuarios (Admin)
- GET `/api/users` - Listar usuarios
- GET `/api/users/:id` - Obtener usuario
- PUT `/api/users/:id` - Actualizar usuario
- DELETE `/api/users/:id` - Eliminar usuario
- GET `/api/users/stats/overview` - Estadísticas generales

## 🐛 Solución de Problemas

### Error de conexión a MongoDB:
- Verifica que MongoDB esté corriendo
- Revisa la URI en el archivo .env
- Si usas MongoDB Atlas, verifica tu IP en la whitelist

### Error CORS:
- Verifica que el frontend esté configurado correctamente
- Revisa las URL en los archivos .env

### Error de Stripe:
- Verifica tus claves API
- Asegúrate de usar las claves de test en desarrollo
- Revisa los webhooks

## 📝 Datos de Prueba

Para probar el sistema, puedes usar estas credenciales:

**Admin:**
- Email: admin@urbancomplex.com
- Password: admin123

**Estudiante:** (debes registrarte desde la app)

## 🚀 Despliegue a Producción

### Backend (Heroku, Railway, etc):
1. Configura las variables de entorno
2. Cambia `NODE_ENV` a `production`
3. Usa claves de Stripe en modo live
4. Configura webhook de Stripe en producción

### Frontend (Vercel, Netlify, etc):
1. Actualiza `REACT_APP_API_URL` con tu URL de backend
2. Usa la clave pública de Stripe en modo live
3. Ejecuta `npm run build`
4. Despliega la carpeta `build`

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Soporte

Para soporte, contacta a: tu@email.com

---

Desarrollado con ❤️ para Urban Complex
