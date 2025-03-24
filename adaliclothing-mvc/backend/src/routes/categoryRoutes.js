import express from 'express';

const router = express.Router();

export default (categoryController) => {
  // Kategóriák lekérése
  router.get('/categories', categoryController.getAllCategories.bind(categoryController));

  return router;
};
