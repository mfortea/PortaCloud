const express = require('express');
const passport = require('passport');
const SavedItem = require('../models/SavedItem');
const getDeviceInfo = require('../utils/deviceInfo');
const router = express.Router();

// Ruta para guardar un nuevo elemento
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {

    const { os, browser, deviceType, content, type } = req.body;

    // Creamos un nuevo elemento guardado
    const newItem = new SavedItem({
      userId: req.user._id,
      os,
      browser,
      deviceType,
      content,
      type,
      createdAt: new Date(),
    });

    // Guardamos el elemento en la base de datos
    await newItem.save();

    // Respondemos con el elemento guardado
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error al guardar el elemento:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Ruta para obtener todos los elementos guardados por el usuario
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Buscamos todos los elementos guardados por el usuario y los ordenamos por fecha de creación
    const items = await SavedItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para eliminar un elemento guardado por su ID
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Eliminamos el elemento por su ID
    await SavedItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Elemento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;