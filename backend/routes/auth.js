const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Device = require("../models/Device");
const { v4: uuidv4 } = require("uuid");
const UAParser = require('ua-parser-js');
const passport = require('passport');
const getDeviceInfo = require('../utils/deviceInfo');
const Log = require('../models/Log');
const router = express.Router();

let io;

router.use((req, res, next) => {
  if (io) {
    req.io = io;
  }
  next();
});

router.post("/set-socket", (req, res) => {
  io = req.app.get('io');
  res.status(200).json({ message: "Socket.io conectado" });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const userExists = await User.findOne({ username });

  if (userExists) {
    return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      username: newUser.username,
      role: newUser.role,
      userId: newUser._id
    });
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const newLog = new Log({
      userId: newUser._id,
      action: 'register',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent']
    });
    await newLog.save();

  } catch (err) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "Usuario no encontrado" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Credenciales incorrectas" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const { os, browser, deviceType } = getDeviceInfo(req.headers["user-agent"]);

  user.lastLogin = new Date();
  await user.save();

  const deviceId = uuidv4();
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const newLog = new Log({
    userId: user._id,
    action: 'login',
    ipAddress: ipAddress,
    userAgent: req.headers['user-agent'],
    details: {
      deviceId: deviceId,
      os: os,
      browser: browser
    }
  });
  await newLog.save();

  const newDevice = await Device.create({
    userId: user._id,
    deviceId,
    os,
    browser,
    deviceType,
    lastActive: new Date(),
  });

  if (io) {
    io.emit("updateDevices", await Device.find({ userId: user._id }));
    io.emit("newConnection", { message: "Nuevo cliente conectado", userId: user._id });
  }

  res.json({ token, deviceId, username: user.username, role: user.role, userId: user._id });
});

router.get("/profile", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({
      username: user.username,
      role: user.role,
      userId: user._id,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil", error });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    await Device.deleteOne({ userId: decoded.userId, deviceId: req.body.deviceId });
    res.json({ message: "Sesión cerrada correctamente" });
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const newLog = new Log({
      userId: decoded.userId,
      action: 'logout',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent']
    });
    await newLog.save();

    if (io) {
      io.emit("updateDevices", await Device.find({ userId: decoded.userId }));
      io.emit("disconnectClient", { message: "Cliente desconectado", userId: decoded.userId });
    }
  });
});

router.get("/devices", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    const devices = await Device.find({ userId: decoded.userId }).select("deviceId os browser deviceType clipboardContent");
    console.log("Dispositivos obtenidos:", devices);

    res.json(devices);
  });
});

router.post("/updateClipboard", async (req, res) => {
  const { deviceId, clipboardContent } = req.body;

  try {
    const device = await Device.findOne({ deviceId });
    if (!device) return res.status(404).json({ message: "Dispositivo no encontrado" });

    device.clipboardContent = clipboardContent;
    device.lastActive = new Date();
    await device.save();

    res.json({ message: "Contenido del portapapeles actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el contenido del portapapeles", error });
  }
});

router.put("/update-username", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { newUsername } = req.body;
    if (!newUsername) {
      return res.status(400).json({ message: "El nuevo nombre de usuario es requerido" });
    }

    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const newLog = new Log({
      userId: userId,
      action: 'username_changed',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'],
      details: {
        oldUsername: currentUser.username,
        newUsername: newUsername
      }
    });
    await newLog.save();

    res.json({ message: "Nombre de usuario cambiado correctamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar el nombre de usuario", error: error.message });
  }
});

router.put("/update-password", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "La contraseña actual y la nueva contraseña son requeridas" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const newLog = new Log({
      userId: userId,
      action: 'password_changed',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent']
    });
    await newLog.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la contraseña", error: error.message });
  }
});

router.delete("/delete-account", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "La contraseña es requerida" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña es incorrecta" });
    }

    await User.findByIdAndDelete(userId);
    await Device.deleteMany({ userId });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const newLog = new Log({
      userId: userId,
      action: 'account_deleted',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent']
    });
    await newLog.save();

    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la cuenta", error: error.message });
  }
});

module.exports = router;
