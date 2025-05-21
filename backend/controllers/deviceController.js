// controllers/deviceController.js
const Device = require('../models/Device');
const ContentRegistry = require('../models/ContentRegistry');
const fs = require('fs');
const crypto = require('crypto');

exports.updateClipboard = async (req, res) => {
  const { deviceId, type } = req.body;

  try {
    let content, hash;

    if (type === "image" && req.file) {
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
};

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.userId })
      .select("deviceId os browser deviceType clipboardContent");
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener dispositivos", error });
  }
};