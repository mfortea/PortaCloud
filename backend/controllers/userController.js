const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');
const Device = require('../models/Device');
const SavedItem = require('../models/SavedItem');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordExpires: user.resetPasswordExpires,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil", error });
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername) {
      return res.status(400).json({ message: "El nuevo nombre de usuario es requerido" });
    }

    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    const currentUser = await User.findById(req.user?.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { username: newUsername },
      { new: true }
    );

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: req.user?.userId || null,
      username: currentUser.username,
      action: 'username_changed',
      ipAddress,
      userAgent: req.headers['user-agent'],
      details: {
        oldUsername: currentUser.username,
        newUsername
      }
    }).save();

    res.json({ message: "Nombre de usuario cambiado correctamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar el nombre de usuario", error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "La contraseña actual y la nueva contraseña son requeridas" });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: req.user?.userId || null,
      username: req.user.username,
      action: 'password_changed',
      ipAddress,
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la contraseña", error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "La contraseña es requerida" });

    const user = await User.findById(req.user?.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "La contraseña es incorrecta" });

    await Promise.all([
      User.findByIdAndDelete(req.user.userId),
      Device.deleteMany({ userId: req.user.userId }),
      SavedItem.deleteMany({ userId: req.user.userId })
    ]);

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: req.user?.userId || null,
      username: req.user.username,
      action: 'account_deleted',
      ipAddress,
      userAgent: req.headers['user-agent'],
      details: {
        deletedUsername: user.username
      }
    }).save();

    res.json({ message: "Cuenta y datos asociados eliminados correctamente" });
  } catch (error) {
    console.warn("deleteAccount error:", error);
    res.status(500).json({ message: "Error al eliminar la cuenta", error: error.message });
  }
};