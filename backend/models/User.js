// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }, 
  createdAt: { type: Date, default: Date.now }, 
  lastLogin: { type: Date } 
});

const User = mongoose.model('User', userSchema);

module.exports = User;