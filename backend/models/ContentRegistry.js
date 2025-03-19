// models/ContentRegistry.js
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  filePath: String,
  referenceCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("ContentRegistry", contentSchema);