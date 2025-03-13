require('dotenv').config(); // Cargar variables de entorno desde .env
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Conectado a MongoDB');

    const hashedPassword = await bcrypt.hash('admin', 10); // Cambia 'adminpassword' por la contraseña que desees
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Usuario administrador creado exitosamente');
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB o crear el usuario:', err);
  })
  .finally(() => {
    mongoose.connection.close();
  });