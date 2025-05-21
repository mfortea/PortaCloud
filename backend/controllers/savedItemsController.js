// controllers/savedItemsController.js
const SavedItem = require('../models/SavedItem');
const ContentRegistry = require('../models/ContentRegistry');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.createSavedItem = async (req, res) => {
  try {
    const { os, browser, deviceType, type, content } = req.body;
    const userId = req.user.userId;

    if (!os || !browser || !deviceType || !type) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    let savedContent;
    let filePath = null;

    if (type === "image" && req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

      const existing = await ContentRegistry.findOne({ hash });
      if (existing) {
        fs.unlinkSync(req.file.path);
        filePath = existing.filePath;
      } else {
        filePath = `/uploads/${req.file.filename}`;
        await ContentRegistry.create({ hash, filePath, referenceCount: 1 });
      }

      savedContent = filePath;
    } else {
      savedContent = content;
    }

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
};

exports.getSavedItems = async (req, res) => {
  try {
    const items = await SavedItem.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener elementos" });
  }
};

exports.deleteSavedItem = async (req, res) => {
  try {
    const item = await SavedItem.findOne({
      _id: req.params.id,
      userId: req.user.userId 
    });

    if (!item) return res.status(404).json({ message: "Elemento no encontrado" });

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
};

exports.deleteAllSavedItems = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "La contraseña es requerida" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña es incorrecta" });
    }

    await SavedItem.deleteMany({ userId: req.user.userId });
    res.json({ message: "Todos los datos de guardados han sido eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar los guardados:", error);
    res.status(500).json({
      message: "Error al eliminar los guardados",
      error: error.message,
    });
  }
};