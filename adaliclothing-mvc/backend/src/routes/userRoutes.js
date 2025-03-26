import express from 'express';

const router = express.Router();

export default (userController) => {
 
  router.get('/users', userController.getAllUsers.bind(userController));
  

  router.delete('/users/:id', userController.deleteUser.bind(userController));
  
  
  router.get('/check-user/:username', userController.checkUser.bind(userController));

  return router;
};
