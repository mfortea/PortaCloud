const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const savedItemsController = require('../controllers/savedItemsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp_uploads/"); // carpeta temporal antes de mover archivo
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/', 
  passport.authenticate('jwt', { session: false }),
  upload.single("image"),
  savedItemsController.createSavedItem
);

router.post('/save-text',
  passport.authenticate('jwt', { session: false }),
  savedItemsController.handleSaveContent
);

router.get('/', 
  passport.authenticate('jwt', { session: false }), 
  savedItemsController.getSavedItems
);

router.delete('/:id', 
  passport.authenticate('jwt', { session: false }), 
  savedItemsController.deleteSavedItem
);

router.post('/deleteAll',
  passport.authenticate('jwt', { session: false }),
  savedItemsController.deleteAllSavedItems
);

module.exports = router;
