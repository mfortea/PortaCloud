// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const passport = require("passport");


// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Acceso denegado" });
    }
  };
  
  // Obtener la lista de usuarios
  router.get("/users", passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
      const users = await User.find({}, { password: 0 }); // Excluir la contraseña
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los usuarios", error });
    }
  });
  

router.post("/users", passport.authenticate('jwt', { session: false }), async (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Acceso no autorizado" });
  }

  const { username, password, role } = req.body;


  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números" 
    });
  }

  try {

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "El nombre de usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario", error: error.message });
  }
});

// Modificar el rol de un usuario
router.put("/users/:id/role", passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Rol actualizado exitosamente", user });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el rol", error });
  }
});

// Eliminar un usuario
router.delete("/users/:id", passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error });
  }
});

module.exports = router;