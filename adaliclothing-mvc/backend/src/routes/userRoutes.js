import express from 'express';

const router = express.Router();

export default (userController) => {
  // Felhasználók lekérése
  router.get('/users', userController.getAllUsers.bind(userController));
  
  // Felhasználó törlése
  router.delete('/users/:id', userController.deleteUser.bind(userController));
  
  // Felhasználó ellenőrzése
  router.get('/check-user/:username', userController.checkUser.bind(userController));

  return router;
};
