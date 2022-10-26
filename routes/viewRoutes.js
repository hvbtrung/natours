const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/signup', authController.isLoggedIn, authController.counterProtect, viewController.getSignupForm);
router.get('/login', authController.isLoggedIn, authController.counterProtect, viewController.getLoginForm);
router.get('/forgotPassword', authController.isLoggedIn, authController.counterProtect, viewController.getForgotPasswordForm);
router.get('/resetPassword/:resetToken', authController.isLoggedIn, authController.counterProtect, viewController.getResetPassword);

router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', bookingController.createBookingCheckout, authController.protect, viewController.getMyTours);

router.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = router;