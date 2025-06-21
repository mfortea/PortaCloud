// models/Device.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  os: {
    type: String,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    required: true,
    enum: ["equipo", "tablet", "smartphone"],
    default: "equipo",
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  clipboardContent: {
    type: String,
  },
  contentHash: {
    type: String,
    index: true,
  },
});


deviceSchema.pre("save", function (next) {
  if (this.isModified("clipboardContent")) {
    this.contentHash = crypto
      .createHash("sha256")
      .update(this.clipboardContent)
      .digest("hex");
  }
  next();
});


deviceSchema.pre("remove", async function (next) {
  if (this.contentHash) {
    await ContentRegistry.updateOne(
      { hash: this.contentHash },
      { $inc: { referenceCount: -1 } }
    );
  }
  next();
});

// Índice para eliminar dispositivos inactivos después de 1 hora
deviceSchema.index({ lastActive: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("Device", deviceSchema);