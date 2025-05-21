// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');

router.get('/profile', passport.authenticate('jwt', { session: false }), userController.getProfile);
router.put('/update-username', passport.authenticate('jwt', { session: false }), userController.updateUsername);
router.put('/update-password', passport.authenticate('jwt', { session: false }), userController.updatePassword);
router.delete('/delete-account', passport.authenticate('jwt', { session: false }), userController.deleteAccount);

module.exports = router;