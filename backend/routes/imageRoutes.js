const express = require('express');
const router = express.Router();
const passport = require('passport');
const savedItemsController = require('../controllers/savedItemsController');
const deviceController = require('../controllers/deviceController');

// Ruta protegida para las imágenes guardadas en 'private_uploads'
router.get('/:filename',
  passport.authenticate('jwt', { session: false }),
  savedItemsController.getProtectedImage
);

// Ruta protegida para las imágenes temporales en 'temp_uploads'
router.get('/temp_image/:filename',
  passport.authenticate('jwt', { session: false }),
  deviceController.getTempImage // Función que maneja la solicitud para las imágenes temporales
);

module.exports = router;
