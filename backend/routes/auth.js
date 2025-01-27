// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Ruta para el registro de un nuevo usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Verificar si el nombre de usuario ya existe
  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
  }

  // Encriptar la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crear el nuevo usuario
  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

// Ruta para el login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "Usuario no encontrado" });
  }

  // Comparar las contraseñas
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Credenciales incorrectas" });
  }

  // Crear el token JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Ruta protegida para el perfil del usuario
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }

    const user = await User.findById(decoded.userId);
    res.json({ username: user.username });
  });
});

module.exports = router;
