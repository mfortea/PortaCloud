const mongoose = require("mongoose");

const tempImageSchema = new mongoose.Schema({
  deviceId: String,
  content: String, // URL o Base64
  createdAt: { type: Date, expires: 3600, default: Date.now } // Elimina después de 1 hora
});

module.exports = mongoose.model("TempImage", tempImageSchema);