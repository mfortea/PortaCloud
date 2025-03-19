// models/SavedItem.js
const mongoose = require("mongoose");

const savedItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
    default: "equipo"
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
    enum: ["text", "image"] 
  },
  filePath: String 
});

const SavedItem = mongoose.model("SavedItem", savedItemSchema);

module.exports = SavedItem;
