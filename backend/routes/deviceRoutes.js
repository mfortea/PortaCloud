// routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const deviceController = require('../controllers/deviceController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/updateClipboard', 
  upload.single("image"), 
  deviceController.updateClipboard
);

router.get('/devices', 
  passport.authenticate('jwt', { session: false }), 
  deviceController.getDevices
);

module.exports = router;