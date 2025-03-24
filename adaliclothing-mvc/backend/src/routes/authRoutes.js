import express from 'express';

const router = express.Router();

export default (authController) => {
  // Regisztráció
  router.post('/register', authController.register.bind(authController));
  
  // Bejelentkezés
  router.post('/login', authController.login.bind(authController));
  
  // Elfelejtett jelszó
  router.post('/forgot-password', authController.forgotPassword.bind(authController));
  
  // Jelszó visszaállítás
  router.post('/reset-password', authController.resetPassword.bind(authController));
  
  // Kupon frissítés
  router.post('/update-coupon', authController.updateCoupon.bind(authController));

  return router;
};
