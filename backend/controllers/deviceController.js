// controllers/deviceController.js
const Device = require('../models/Device');
const ContentRegistry = require('../models/ContentRegistry');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Función para resolver el clipboardContent: si es ObjectId busca nombre archivo real
async function resolveClipboardContent(content) {
  if (content && content.length === 24 && /^[0-9a-fA-F]+$/.test(content)) {
    const registry = await ContentRegistry.findById(content);
    if (registry) {
      return path.basename(registry.filePath);
    }
  }
  return content;
}

// Función para generar el nombre único para la imagen y evitar duplicados
const generateUniqueFileName = (file) => {
  // Leemos el archivo en un buffer
  const fileBuffer = fs.readFileSync(file.path);  // Leemos el archivo desde la ruta temporal
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');  // Creamos el hash con el buffer
  return `${hash}${path.extname(file.originalname)}`;  // Retornamos el nombre único con extensión
};

exports.updateClipboard = async (req, res) => {
  const { deviceId, type } = req.body;

  try {
    let content;

    if (type === 'image' && req.file) {
      // Carpeta por dispositivo para aislamiento
      const deviceDir = path.resolve(__dirname, '..', 'temp_uploads', deviceId);
      console.log("Ruta para guardar la imagen:", deviceDir); // Verifica que la ruta es correcta
      if (!fs.existsSync(deviceDir)) {
        fs.mkdirSync(deviceDir, { recursive: true });
      }

      const uniqueFileName = generateUniqueFileName(req.file);
      const filePath = path.join(deviceDir, uniqueFileName);
      

      // Solo mover si no existe ya
      if (!fs.existsSync(filePath)) {
        fs.renameSync(req.file.path, filePath);
      } else {
        // Eliminar archivo temporal multer si no se usa
        fs.unlinkSync(req.file.path);
      }

      // Guardar ruta relativa con deviceId para que frontend la use
      content = `/device/temp_image/${deviceId}/${uniqueFileName}`;
    } else {
      content = req.body.content;
      if (req.file && req.file.path) {
        // En caso de recibir archivo pero no imagen, eliminarlo para no acumular basura
        fs.unlinkSync(req.file.path);
      }
    }

    // Actualizamos el contenido en el dispositivo
    await Device.findOneAndUpdate(
      { deviceId },
      {
        clipboardContent: content,
        lastActive: new Date(),
      },
      { new: true }
    );

    res.json({ message: 'Contenido actualizado', content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el contenido' });
  }
};

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.userId }).select("deviceId os browser deviceType clipboardContent");

    // Resolvemos clipboardContent para que sea nombre archivo y no ObjectId
    const devicesResolved = await Promise.all(
      devices.map(async (device) => {
        const resolvedClipboardContent = await resolveClipboardContent(device.clipboardContent);
        return {
          ...device.toObject(),
          clipboardContent: resolvedClipboardContent,
        };
      })
    );

    res.json(devicesResolved);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener dispositivos", error });
  }
};

exports.getTempImage = async (req, res) => {
  try {
    // Log para verificar el token que está llegando
    console.log("Authorization Header:", req.headers.authorization);  // Muestra el header Authorization que contiene el token
    console.log("Usuario autenticado (req.user):", req.user);  // Muestra el usuario autenticado

    const { deviceId, filename } = req.params;

    // Verificamos si el dispositivo pertenece al usuario autenticado
    const device = await Device.findOne({ deviceId, userId: req.user.userId });
    if (!device) {
      console.warn(`Acceso denegado: El dispositivo ${deviceId} no pertenece al usuario ${req.user.userId}`);
      return res.status(403).json({ message: "Acceso denegado a la imagen" });
    }

    const imagePath = path.resolve(__dirname, '..', 'temp_uploads', deviceId, filename);
    console.log("Ruta de la imagen:", imagePath);  // Log para verificar la ruta del archivo

    if (!fs.existsSync(imagePath)) {
      console.warn(`La imagen no se encuentra en la ruta: ${imagePath}`);
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error en la petición para obtener imagen:", error);
    res.status(500).json({ message: "Error al enviar la imagen" });
  }
};


