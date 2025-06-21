// controllers/adminController.js
const User = require('../models/User');
const Log = require('../models/Log');
const SavedItem = require('../models/SavedItem');
const Device = require('../models/Device');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios", error });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, role, email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es obligatorio" });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números" 
    });
  }

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: "El nombre de usuario o correo electrónico ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role, email });
    await newUser.save();

    // Obtener IP y registrar log
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: req.user?.userId || null,  
      action: 'user_created',
      ipAddress: ipAddress,
      details: {
        createdUser: username
      }
    }).save();

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario", error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: req.user.userId, 
      action: 'role_changed',
      ipAddress: ipAddress,
      details: {
        targetUser: updatedUser.username, 
        newRole: updatedUser.role 
      }
    }).save();

    res.json({ message: "Rol actualizado exitosamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el rol", error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el usuario antes de eliminarlo
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el usuario y sus datos relacionados
    await Promise.all([
      User.findByIdAndDelete(id),
      Device.deleteMany({ userId: id }),
      SavedItem.deleteMany({ userId: id })
    ]);

    // Registrar en el log usando el username
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: req.user.userId,
      action: 'user_deleted',
      ipAddress: ipAddress,
      details: { deletedUser: userToDelete.username }
    }).save();

    res.json({ message: "Usuario y datos asociados eliminados correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'username');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los logs", error });
  }
};