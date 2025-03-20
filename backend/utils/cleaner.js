const fs = require("fs");
const path = require("path");
const SavedItem = require("../models/SavedItem");

const cleanOrphanFiles = async () => {
  try {
    console.log("Iniciando limpieza de archivos huérfanos...");

    const uploadDir = path.resolve(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      console.log("La carpeta 'uploads' no existe. No hay nada que limpiar.");
      return;
    }

    // Obtener lista de archivos en 'uploads'
    const filesInUploads = fs.readdirSync(uploadDir);
    console.log(`Archivos en 'uploads':`, filesInUploads);

    // Obtener lista de archivos guardados en `SavedItem`
    const savedItems = await SavedItem.find({}, "filePath");
    const savedFilePaths = new Set(savedItems.map(item => item.filePath));

    console.log("Archivos referenciados en 'SavedItem':", savedFilePaths);

    for (const file of filesInUploads) {
      const filePath = `/uploads/${file}`;

      if (!savedFilePaths.has(filePath)) {
        // No está referenciado en `SavedItem`, lo eliminamos
        const fullPath = path.join(uploadDir, file);
        try {
          fs.unlinkSync(fullPath);
          console.log(`Archivo eliminado: ${fullPath}`);
        } catch (unlinkErr) {
          console.error(`Error eliminando ${fullPath}:`, unlinkErr);
        }
      }
    }
    
  } catch (err) {
    console.error("Error en la limpieza de archivos huérfanos:", err);
  }
};

// Ejecutar cada 24 horas
setInterval(cleanOrphanFiles, 24 * 60 * 60 * 1000);

module.exports = cleanOrphanFiles;
