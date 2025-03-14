// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const passport = require("passport");
const Log = require('../models/Log');


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

router.put("/users/:id/role", passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Obtener el usuario antes de actualizarlo
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar el rol
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const log = new Log({
      userId: req.user.userId, 
      action: 'role_changed',
      ipAddress: ipAddress,
      details: {
        targetUser: updatedUser.username, 
        newRole: updatedUser.role 
      }
    });
    await log.save();

    res.json({ message: "Rol actualizado exitosamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el rol", error });
  }
});

// Eliminar un usuario
router.delete("/users/:id", passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el usuario antes de eliminarlo
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el usuario
    await User.findByIdAndDelete(id);

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Registrar log
    const log = new Log({
      userId: req.user.userId, 
      action: 'user_deleted',
      ipAddress: ipAddress,
      details: {
        deletedUser: userToDelete.username 
      }
    });
    await log.save();

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error });
  }
});

// Obtener logs
router.get("/logs", passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'username');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los logs", error });
  }
});

module.exports = router;