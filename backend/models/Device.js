const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deviceId: { type: String, required: true },
  os: { type: String, required: true },
  browser: { type: String, required: true },
  lastActive: { type: Date, default: Date.now },
  clipboardContent: { type: String, default: "Sin contenido" },
});

module.exports = mongoose.model("Device", deviceSchema);
