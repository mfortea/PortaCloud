const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Device = require("../models/Device");
const { v4: uuidv4 } = require("uuid");
const UAParser = require('ua-parser-js');  // Usamos ua-parser-js para una detección más precisa

const router = express.Router();

// Middleware de WebSocket para gestionar la conexión
let io;

router.use((req, res, next) => {
  // Si existe io (la instancia de Socket.io), la usamos para emitir eventos
  if (io) {
    req.io = io;
  }
  next();
});

// Establecer la conexión de WebSocket con el servidor
router.post("/set-socket", (req, res) => {
  io = req.app.get('io');
  res.status(200).json({ message: "Socket.io conectado" });
});

// Registro de usuario
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
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

// Login con detección de dispositivo
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

  // Crear JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Detectar sistema operativo y navegador con ua-parser-js
  const parser = new UAParser();
  const result = parser.setUA(req.headers["user-agent"]).getResult();
  const os = result.os.name || "Desconocido";
  const browser = result.browser.name || "Desconocido";

  console.log("User-Agent recibido:", req.headers["user-agent"]); // Log para depuración
  console.log("Sistema Operativo:", os); // Log para depuración
  console.log("Navegador:", browser); // Log para depuración

  // Crear nuevo dispositivo
  const deviceId = uuidv4();  // ID único para el dispositivo
  const newDevice = await Device.create({
    userId: user._id,
    deviceId,
    os,
    browser,
    lastActive: new Date(),
  });

  // Emitir evento de dispositivo conectado a todos los clientes
  if (io) {
    io.emit("updateDevices", await Device.find({ userId: user._id }));
    io.emit("newConnection", { message: "Nuevo cliente conectado", userId: user._id });
  }

  res.json({ token, deviceId });
});

// Obtener perfil del usuario
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    const user = await User.findById(decoded.userId);
    res.json({ username: user.username });
  });
});

// Cerrar sesión y eliminar el dispositivo
router.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    await Device.deleteOne({ userId: decoded.userId, deviceId: req.body.deviceId });
    res.json({ message: "Sesión cerrada correctamente" });

    // Emitir evento de desconexión de dispositivo
    if (io) {
      io.emit("updateDevices", await Device.find({ userId: decoded.userId }));
      io.emit("disconnectClient", { message: "Cliente desconectado", userId: decoded.userId });
    }
  });
});

// Obtener dispositivos conectados de un usuario
router.get("/devices", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    const devices = await Device.find({ userId: decoded.userId });
    res.json(devices);
  });
});

// Ruta para actualizar el contenido del portapapeles de un dispositivo
router.post("/updateClipboard", async (req, res) => {
  const { deviceId, clipboardContent } = req.body;

  try {
    const device = await Device.findOne({ deviceId });
    if (!device) return res.status(404).json({ message: "Dispositivo no encontrado" });

    device.clipboardContent = clipboardContent; // Actualizamos el contenido del portapapeles
    await device.save();

    res.json({ message: "Contenido del portapapeles actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el contenido del portapapeles", error });
  }
});

module.exports = router;
