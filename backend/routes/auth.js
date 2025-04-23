// routes/auth.js
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
const SavedItem = require('../models/SavedItem')
const multer = require("multer");
const ContentRegistry = require("../models/ContentRegistry");
const crypto = require("crypto");
const fs = require("fs");
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

let io;

router.use((req, res, next) => {
  if (io) {
    req.io = io;
  }
  next();
});


router.post("/updateClipboard", upload.single("image"), async (req, res) => {
  const { deviceId, type } = req.body;

  try {
    let content, hash;

    if (type === "image" && req.file) {
      // Generar hash solo para imágenes
      const fileBuffer = fs.readFileSync(req.file.path);
      hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

      const existing = await ContentRegistry.findOne({ hash });
      if (existing) {
        fs.unlinkSync(req.file.path);
        content = existing.filePath;
        await ContentRegistry.updateOne(
          { hash },
          { $inc: { referenceCount: 1 } }
        );
      } else {
        content = `/uploads/${req.file.filename}`;
        await ContentRegistry.create({ hash, filePath: content, referenceCount: 1 });
      }
    } else {
      // Manejo simple para texto
      content = req.body.content;
      hash = null;
    }

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        clipboardContent: content,
        contentHash: hash,
        lastActive: new Date(),
      },
      { new: true }
    );

    res.json({ message: "Contenido actualizado", content });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar", error });
  }
});

router.post("/set-socket", (req, res) => {
  io = req.app.get('io');
  res.status(200).json({ message: "Socket.io conectado" });
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Formato de email inválido" });
  }

  const userExists = await User.findOne({ $or: [{ username }, { email }] });

  if (userExists) {
    return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

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
  const { login, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { username: login },
        { email: login }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Usuario/email no encontrado" });
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

    // Registrar log
    const newLog = new Log({
      userId: user._id,
      action: 'login',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'],
      details: {
        deviceId: deviceId,
        os: os,
        browser: browser,
        loginMethod: login.includes('@') ? 'email' : 'username'
      }
    });
    await newLog.save();

    // Registrar dispositivo
    const newDevice = await Device.create({
      userId: user._id,
      deviceId,
      os,
      browser,
      deviceType,
      lastActive: new Date(),
    });

    // Emitir eventos de socket.io
    if (io) {
      io.emit("updateDevices", await Device.find({ userId: user._id }));
      io.emit("newConnection", { message: "Nuevo cliente conectado", userId: user._id });
    }

    res.json({
      token,
      deviceId,
      username: user.username,
      email: user.email, // Nuevo campo en la respuesta
      role: user.role,
      userId: user._id
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


router.get("/profile", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
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
    if (!token) return res.status(403).json({ message: "Token no proporcionado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "La contraseña es requerida" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "La contraseña es incorrecta" });

    await Promise.all([
      User.findByIdAndDelete(userId),
      Device.deleteMany({ userId }),
      SavedItem.deleteMany({ userId })
    ]);

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: userId,
      action: 'account_deleted',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ message: "Cuenta y datos asociados eliminados correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la cuenta", error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Ruta para solicitar reseteo
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const mailOptions = {
      to: email,
      subject: "PortaCloud - Recuperación de contraseña",
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f9; padding: 30px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 40px; text-align: center;">
    
            <img src="https://portacloud.vercel.app/logo.png" alt="PortaCloud" style="max-width: 100px !important; margin-bottom: 20px;">
            
            <h1 style="color: #333; font-size: 28px; font-weight: 600; margin-bottom: 20px;">Recuperación de Contraseña</h1>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">Hemos recibido una solicitud para restablecer tu contraseña en PortaCloud.</p>
    
            <a href="${resetLink}" style="display: inline-block; background-color: #007BFF; color: #fff; padding: 14px 40px; font-size: 16px; font-weight: bold; border-radius: 4px; text-decoration: none; transition: background-color 0.3s; margin-bottom: 20px;">
              Restablecer mi Contraseña
            </a>
    
            <p style="color: #888; font-size: 14px;">Este enlace expirará en 24 horas.</p>
            
            <div style="margin-top: 30px;">
              <p style="color: #888; font-size: 14px;">Si no solicitaste este correo, puedes ignorarlo.</p>
            </div>
          </div>
        </div>
      `
    };

    console.log("Enviando correo a:", email);
    console.log("resetLink:", resetLink);

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar correo:", error);
        return res.status(500).json({ message: "Error al enviar el correo", error: error.message });
      } else {
        console.log("Correo enviado:", info.response);
        return res.json({ message: "Correo enviado" });
      }
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "El enlace de recuperación es inválido o ha expirado"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Error al restablecer la contraseña",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
