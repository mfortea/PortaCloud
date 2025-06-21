// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Device = require('../models/Device');
const Log = require('../models/Log');
const { v4: uuidv4 } = require('uuid');
const getDeviceInfo = require('../utils/deviceInfo');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Formato de email inválido" });
  }

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: newUser._id,
      username: newUser.username,
      action: 'register',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent']
    }).save();

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      username: newUser.username,
      role: newUser.role,
      userId: newUser._id
    });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

exports.login = async (req, res) => {
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

    await new Log({
      userId: user._id,
      username: user.username,
      action: 'login',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'],
      details: {
        deviceId: deviceId,
        os: os,
        browser: browser,
        loginMethod: login.includes('@') ? 'email' : 'username'
      }
    }).save();

    const newDevice = await Device.create({
      userId: user._id,
      deviceId,
      os,
      browser,
      deviceType,
      lastActive: new Date(),
    });

    res.json({
      token,
      deviceId,
      username: user.username,
      email: user.email,
      role: user.role,
      userId: user._id
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    await Device.deleteOne({ userId: decoded.userId, deviceId: req.body.deviceId });
    
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await new Log({
      userId: decoded.userId,
      username: decoded.username,
      action: 'logout',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent']
    }).save();

    res.json({ message: "Sesión cerrada correctamente" });
  });
};

exports.forgotPassword = async (req, res) => {
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

    await transporter.sendMail(mailOptions);
    res.json({ message: "Correo enviado" });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
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
};