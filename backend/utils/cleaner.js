// utils/cleaner.js
const ContentRegistry = require("../models/ContentRegistry");
const fs = require("fs");
const path = require("path");

const cleanOrphanFiles = async () => {
  try {
    // Eliminar imágenes sin referencias
    const usedImages = await Device.distinct("clipboardContent");
    const allImages = await ContentRegistry.find({});
    
    allImages.forEach(async (image) => {
      if (!usedImages.includes(image.filePath)) {
        const fullPath = path.join(__dirname, "..", image.filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        await ContentRegistry.deleteOne({ _id: image._id });
      }
    });

    // Eliminar archivos temporales antiguos (más de 1 hora)
    const tempFiles = fs.readdirSync("uploads");
    tempFiles.forEach(file => {
      const filePath = path.join("uploads", file);
      const stats = fs.statSync(filePath);
      if (Date.now() - stats.mtimeMs > 3600000) {
        fs.unlinkSync(filePath);
      }
    });

  } catch (err) {
    console.error("Error en limpieza:", err);
  }
};

// Ejecutar cada 24 horas
setInterval(cleanOrphanFiles, 24 * 60 * 60 * 1000);

module.exports = cleanOrphanFiles;