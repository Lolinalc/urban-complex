require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error al conectar:', error);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    await connectDB();

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ email: 'admin@urbancomplex.com' });

    if (existingAdmin) {
      console.log('El usuario admin ya existe');
      console.log('Email: admin@urbancomplex.com');
      console.log('Contraseña: admin123');
      process.exit(0);
    }

    // Crear usuario admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Urban Complex',
      email: 'admin@urbancomplex.com',
      password: 'admin123',
      role: 'admin',
      phone: '555-0000',
      status: 'active'
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('\nCredenciales:');
    console.log('Email: admin@urbancomplex.com');
    console.log('Contraseña: admin123');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');

    process.exit(0);
  } catch (error) {
    console.error('Error al crear admin:', error);
    process.exit(1);
  }
};

createAdmin();
