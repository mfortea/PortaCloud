// routes/saved.js
const express = require('express');
const passport = require('passport');
const SavedItem = require('../models/SavedItem');
const bcrypt = require("bcrypt");
const User = require("../models/User");
const ContentRegistry = require('../models/ContentRegistry');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


router.post("/", 
  passport.authenticate('jwt', { session: false }),
  upload.single("image"),
  async (req, res) => {
    console.log("Iniciando guardado de contenido...");

    try {
      const { os, browser, deviceType, type, content } = req.body;
      const userId = req.user.userId;

      if (!os || !browser || !deviceType || !type) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      let savedContent;
      let filePath = null;

      if (type === "image" && req.file) {
        // Generar hash para la imagen
        const fileBuffer = fs.readFileSync(req.file.path);
        const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        // Verificar si la imagen ya existe en ContentRegistry
        const existing = await ContentRegistry.findOne({ hash });
        if (existing) {
          // Si ya existe, usar la ruta existente y eliminar el archivo temporal
          fs.unlinkSync(req.file.path);
          filePath = existing.filePath;
        } else {
          // Si no existe, guardar la nueva imagen
          filePath = `/uploads/${req.file.filename}`;
          await ContentRegistry.create({ hash, filePath, referenceCount: 1 });
        }

        savedContent = filePath;
      } else {
        // Si es texto, usar el contenido directamente
        savedContent = content;
      }

      // Crear y guardar el nuevo elemento en SavedItem
      const newItem = new SavedItem({
        userId,
        os,
        browser,
        deviceType,
        content: savedContent,
        type,
        filePath,
      });

      await newItem.save();
      res.status(201).json(newItem);

    } catch (err) {
      console.error("Error al guardar:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);


router.get('/', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      const items = await SavedItem.find({ userId: req.user.userId })
        .sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener elementos" });
    }
  }
);

router.delete("/:id", 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      const item = await SavedItem.findOne({
        _id: req.params.id,
        userId: req.user.userId 
      });

      if (!item) return res.status(404).json({ message: "Elemento no encontrado" });

      // Eliminar archivo físico
      if (item.type === "image" && item.filePath) {
        const fullPath = path.join(__dirname, "..", item.filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          await ContentRegistry.findOneAndUpdate(
            { filePath: item.filePath },
            { $inc: { referenceCount: -1 } }
          );
        }
      }

      await SavedItem.deleteOne({ _id: req.params.id });
      res.json({ message: "Elemento eliminado" });

    } catch (err) {
      res.status(500).json({ error: "Error al eliminar" });
    }
  }
);

router.post(
  "/deleteAll",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.userId; 
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

      await Promise.all([
        SavedItem.deleteMany({ userId }),
      ]);

      res.json({ message: "Todos los datos de guardados han sido eliminados correctamente" });
    } catch (error) {
      console.error("Error al eliminar los guardados:", error);
      res.status(500).json({
        message: "Error al eliminar los guardados",
        error: error.message,
      });
    }
  }
);

module.exports = router;