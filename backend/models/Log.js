// models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    required: true,
    enum: ['login', 'logout', 'register', 'user_created', 'role_changed', 'user_deleted', 'username_changed', 'password_changed', 'account_deleted'] 
  },
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;