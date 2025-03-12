// models/Device.js
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  os: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    required: true,
    enum: ["equipo", "tablet", "smartphone"],
    default: "equipo"
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  clipboardContent: {
    type: String,
    default: "Sin contenido"
  },
});

// Middleware para eliminar dispositivos inactivos después de x tiempo
deviceSchema.index({ lastActive: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("Device", deviceSchema);