const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Device = require("../models/Device");
const { v4: uuidv4 } = require("uuid");
const UAParser = require('ua-parser-js');
const passport = require('passport');

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
    res.status(201).json({ message: "Usuario registrado exitosamente" });
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

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const parser = new UAParser();
  const result = parser.setUA(req.headers["user-agent"]).getResult();
  const os = result.os.name || "Desconocido";
  const browser = result.browser.name || "Desconocido";

  const deviceId = uuidv4();
  const newDevice = await Device.create({
    userId: user._id,
    deviceId,
    os,
    browser,
    lastActive: new Date(),
  });

  if (io) {
    io.emit("updateDevices", await Device.find({ userId: user._id }));
    io.emit("newConnection", { message: "Nuevo cliente conectado", userId: user._id });
  }

  res.json({ token, deviceId });
});

router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    const user = await User.findById(decoded.userId);
    res.json({ username: user.username });
  });
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

    const devices = await Device.find({ userId: decoded.userId }).select("deviceId os browser clipboardContent");
    console.log("Dispositivos obtenidos:", devices); // Depuración

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