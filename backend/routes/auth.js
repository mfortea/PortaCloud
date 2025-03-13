const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Device = require("../models/Device");
const { v4: uuidv4 } = require("uuid");
const UAParser = require('ua-parser-js');
const passport = require('passport');
const getDeviceInfo = require('../utils/deviceInfo')

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
    
    // Generar token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
      token, // Añadir token
      username: newUser.username,
      role: newUser.role,
      userId: newUser._id 
    });
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

  const deviceId = uuidv4();
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

  res.json({ token, deviceId, username: user.username, role: user.role,  userId: user._id });
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

module.exports = router;