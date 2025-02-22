const express = require('express');
const passport = require('passport');
const SavedItem = require('../models/SavedItem');
const router = express.Router();

// Funciones para mapear valores a nombres legibles
const getReadableOS = (os) => {
  if (os.includes("Win")) return "Windows";
  if (os.includes("Mac")) return "MacOS";
  if (os.includes("Linux")) return "Linux";
  if (os.includes("Android")) return "Android";
  if (os.includes("iPhone") || os.includes("iPad")) return "iOS";
  return "Desconocido";
};

const getReadableBrowser = (browser) => {
  if (browser.includes("Chrome")) return "Google Chrome";
  if (browser.includes("Firefox")) return "Mozilla Firefox";
  if (browser.includes("Safari") && !browser.includes("Chrome")) return "Safari";
  if (browser.includes("Edge")) return "Microsoft Edge";
  if (browser.includes("Opera")) return "Opera";
  return "Desconocido";
};

// Proteger las rutas usando Passport
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  console.log('Token recibido:', req.headers['authorization']);
  
  try {
    const { os, browser, content, type } = req.body;
    console.log('Datos recibidos:', os, browser, content, type); 

    // Convertir os y browser a nombres legibles
    const readableOS = getReadableOS(os);
    const readableBrowser = getReadableBrowser(browser);

    const newItem = new SavedItem({
      userId: req.user._id,
      os: readableOS,       // Guardar el nombre legible del sistema operativo
      browser: readableBrowser, // Guardar el nombre legible del navegador
      content,
      type,
      createdAt: new Date(),
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error al guardar el elemento:', err.message); 
    res.status(500).json({ error: err.message });
  }
});

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const items = await SavedItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await SavedItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Elemento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
