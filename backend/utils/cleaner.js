const fs = require("fs");
const path = require("path");
const Device = require("../models/Device");

const cleanOrphanFiles = async () => {
  try {
    console.log("Iniciando limpieza de archivos huérfanos...");

    // Limpiar archivos huérfanos en temp_uploads
    const tempDir = path.resolve(__dirname, "..", "temp_uploads");
    if (!fs.existsSync(tempDir)) {
      console.log("La carpeta 'temp_uploads' no existe. No hay nada que limpiar.");
      return;
    }

    const deviceDirs = fs.readdirSync(tempDir);
    console.log(`Carpetas en 'temp_uploads':`, deviceDirs);

    // Obtenemos los dispositivos activos con imágenes asociadas
    const devicesWithImages = await Device.find({}, "deviceId clipboardContent");

    const devicesWithActiveImages = new Set(
      devicesWithImages
        .filter(device => device.clipboardContent && device.clipboardContent.startsWith("/device/temp_image/"))
        .map(device => device.deviceId)
    );

    console.log("Dispositivos con imágenes activas:", devicesWithActiveImages);

    // Limpiar las carpetas de dispositivos que no tienen imágenes activas
    for (const deviceDir of deviceDirs) {
      if (deviceDir === ".gitkeep") continue;

      const devicePath = path.join(tempDir, deviceDir);
      if (fs.lstatSync(devicePath).isDirectory() && !devicesWithActiveImages.has(deviceDir)) {
        try {
          // Borrar la carpeta del dispositivo si no tiene imágenes activas
          fs.rmdirSync(devicePath, { recursive: true });
          console.log(`Carpeta eliminada: ${devicePath}`);
        } catch (unlinkErr) {
          console.error(`Error eliminando la carpeta ${devicePath}:`, unlinkErr);
        }
      }
    }
  } catch (err) {
    console.error("Error en la limpieza de archivos huérfanos:", err);
  }
};

// Limpiar archivos huérfanos cada 24 horas
setInterval(cleanOrphanFiles, 24 * 60 * 60 * 1000);

module.exports = cleanOrphanFiles;
