// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const adminController = require('../controllers/adminController');

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Acceso denegado" });
  }
};

router.get('/users', passport.authenticate('jwt', { session: false }), isAdmin, adminController.getUsers);
router.post('/users', passport.authenticate('jwt', { session: false }), isAdmin, adminController.createUser);
router.put('/users/:id/role', passport.authenticate('jwt', { session: false }), isAdmin, adminController.updateUserRole);
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), isAdmin, adminController.deleteUser);
router.get('/logs', passport.authenticate('jwt', { session: false }), isAdmin, adminController.getLogs);

module.exports = router;