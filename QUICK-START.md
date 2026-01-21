# 🚀 Guía de Inicio Rápido - Urban Complex

Sigue estos pasos para tener la aplicación funcionando en minutos.

## 1. Instalación de Dependencias

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 2. Configuración de Variables de Entorno

### Backend (.env)
Crea el archivo `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urban-complex
JWT_SECRET=urbancomplex_secret_key_2024
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_aqui
NODE_ENV=development
```

### Frontend (.env)
Crea el archivo `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_tu_clave_aqui
```

## 3. Configurar MongoDB

Opción A: **MongoDB Local**
```bash
# Iniciar MongoDB
mongod
```

Opción B: **MongoDB Atlas (Cloud - Recomendado)**
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratis
3. Crea un cluster
4. Obtén tu connection string
5. Reemplaza `MONGODB_URI` en el .env

## 4. Poblar Base de Datos

```bash
cd backend

# Crear usuario administrador
npm run create:admin

# Poblar clases del horario
npm run seed:classes
```

Esto creará:
- **Admin**: admin@urbancomplex.com / admin123
- **Clases**: Todas las clases del horario de Urban Complex

## 5. Iniciar la Aplicación

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
✅ Backend corriendo en http://localhost:5000

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```
✅ Frontend corriendo en http://localhost:3000

## 6. Acceder a la Aplicación

Abre tu navegador en: **http://localhost:3000**

### Credenciales de Admin:
- Email: `admin@urbancomplex.com`
- Password: `admin123`

## 7. Probar Funcionalidades

### Como Estudiante:
1. Click en "Registrarse"
2. Completa el formulario
3. Explora el horario de clases
4. Reserva una clase

### Como Admin:
1. Inicia sesión con las credenciales de admin
2. Ve al panel "Admin"
3. Explora estadísticas, estudiantes y reservas

## 🔥 Stripe (Para pagos - Opcional)

Si quieres probar los pagos:

1. Crea cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves de test
3. Actualiza los archivos .env con tus claves
4. Para webhooks en desarrollo:
```bash
# Instala Stripe CLI
brew install stripe/stripe-cli/stripe

# Inicia webhook forwarding
stripe listen --forward-to localhost:5000/api/payments/webhook
```

## ❓ Problemas Comunes

### Error: Cannot connect to MongoDB
- Asegúrate que MongoDB esté corriendo
- Verifica la URI en el .env

### Error: Port 3000 already in use
```bash
# Mata el proceso en el puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Error: Port 5000 already in use
```bash
# Mata el proceso en el puerto 5000
lsof -ti:5000 | xargs kill -9
```

## 📝 Siguientes Pasos

1. Cambia la contraseña del admin
2. Personaliza los colores en `frontend/src/assets/styles/App.css`
3. Agrega el logo de Urban Complex
4. Configura Stripe para pagos reales
5. Despliega a producción

## 🆘 Necesitas Ayuda?

Revisa el `README.md` completo para más detalles o contacta al equipo de soporte.

---

¡Listo! Tu sistema Urban Complex está funcionando 🎉
