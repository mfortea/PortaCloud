const SavedItem = require('../models/SavedItem');
const ContentRegistry = require('../models/ContentRegistry');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET_KEY;

const generateIV = () => crypto.randomBytes(16);

const encrypt = (text) => {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

const decrypt = (ivHex, encryptedData) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

exports.createSavedItem = async (req, res) => {
  try {
    const { os, browser, deviceType, type, content } = req.body;
    const userId = req.user.userId;

    if (!os || !browser || !deviceType || !type) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    if (type === 'image') {
      if (!req.file) {
        return res.status(400).json({ error: "No se proporcionó archivo" });
      }

      const uploadsDir = path.resolve(__dirname, '..', 'private_uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const oldPath = req.file.path;
      const newFileName = `${Date.now()}-${req.file.originalname}`;
      const newPath = path.join(uploadsDir, newFileName);

      fs.renameSync(oldPath, newPath);

      const fileBuffer = fs.readFileSync(newPath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const existing = await ContentRegistry.findOne({ hash });
      if (existing) {
        fs.unlinkSync(newPath);
        await ContentRegistry.findOneAndUpdate({ hash }, { $inc: { referenceCount: 1 } });

        const savedItem = new SavedItem({
          userId,
          os,
          browser,
          deviceType,
          content: existing._id.toString(),
          type,
          filePath: existing.filePath,
        });
        await savedItem.save();
        return res.status(201).json(savedItem);
      } else {
        await ContentRegistry.create({ hash, filePath: newPath, referenceCount: 1 });

        const savedItem = new SavedItem({
          userId,
          os,
          browser,
          deviceType,
          content: newFileName,
          type,
          filePath: newPath,
        });
        await savedItem.save();
        return res.status(201).json(savedItem);
      }
    } else if (type === 'text') {
      if (!content) {
        return res.status(400).json({ error: "No se proporcionó contenido de texto" });
      }
      const { iv, encryptedData } = encrypt(content);
      const savedItem = new SavedItem({
        userId,
        os,
        browser,
        deviceType,
        content: encryptedData,
        iv,
        type,
        filePath: null,
      });
      await savedItem.save();
      return res.status(201).json(savedItem);
    } else {
      return res.status(400).json({ error: "Tipo no soportado" });
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.handleSaveContent = async (req, res) => {
  try {
    req.body.type = 'text';
    await exports.createSavedItem(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error en handleSaveContent" });
  }
};

exports.getProtectedImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.resolve(__dirname, '..', 'private_uploads');
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: "Error al enviar la imagen" });
  }
};

exports.getSavedItems = async (req, res) => {
  try {
    const items = await SavedItem.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    const processedItems = await Promise.all(items.map(async (item) => {
      // Para texto desencriptar
      if (item.type === 'text' && item.content && item.iv) {
        try {
          const decrypted = decrypt(item.iv, item.content);
          return { ...item.toObject(), content: decrypted };
        } catch (err) {
          return item;
        }
      }

      // Para imágenes, si content es id, obtener nombre archivo de ContentRegistry
      if (item.type === 'image') {
        let contentVal = item.content;

        // Si parece un ObjectId (24 caracteres hex), buscamos en ContentRegistry
        if (contentVal && contentVal.length === 24 && /^[0-9a-fA-F]+$/.test(contentVal)) {
          const registry = await ContentRegistry.findById(contentVal);
          if (registry) {
            // Extraemos solo el nombre del archivo (no ruta absoluta)
            contentVal = registry.filePath.split(path.sep).pop();
          }
        }

        // Devolver con content como nombre archivo
        return {
          ...item.toObject(),
          content: contentVal
        };
      }

      return item;
    }));

    res.json(processedItems);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener elementos" });
  }
};


exports.deleteSavedItem = async (req, res) => {
  try {
    const item = await SavedItem.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!item) return res.status(404).json({ message: "Elemento no encontrado" });
    if (item.type === 'image' && item.filePath) {
      if (fs.existsSync(item.filePath)) {
        fs.unlinkSync(item.filePath);
        await ContentRegistry.findOneAndUpdate({ filePath: item.filePath }, { $inc: { referenceCount: -1 } });
      }
    }
    await SavedItem.deleteOne({ _id: req.params.id });
    res.json({ message: "Elemento eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};

exports.deleteAllSavedItems = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "La contraseña es requerida" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    await SavedItem.deleteMany({ userId: req.user.userId });
    res.json({ message: "Todos los datos guardados han sido eliminados correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar los items guardados" });
  }
};
