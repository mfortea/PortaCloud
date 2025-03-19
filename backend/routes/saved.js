const express = require('express');
const passport = require('passport');
const SavedItem = require('../models/SavedItem');
const getDeviceInfo = require('../utils/deviceInfo');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { os, browser, deviceType, type } = req.body;
    const content = type === "image" ? `/uploads/${req.file.filename}` : req.body.content;

    const newItem = new SavedItem({
      userId: req.user.userId,
      os,
      browser,
      deviceType,
      content,
      type,
      filePath: type === "image" ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date(),
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para obtener todos los elementos guardados por el usuario
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const items = await SavedItem.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para eliminar un elemento guardado por su ID
router.delete("/:id", async (req, res) => {
  try {
    const item = await SavedItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elemento no encontrado" });

    // Eliminar archivo físico si es imagen
    if (item.type === "image" && item.filePath) {
      const fullPath = path.join(__dirname, "..", item.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Eliminar registro de ContentRegistry si es imagen
    if (item.type === "image") {
      await ContentRegistry.deleteOne({ filePath: item.filePath });
    }

    await SavedItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Elemento eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;