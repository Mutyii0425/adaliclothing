import express from 'express';

const router = express.Router();

export default (productController) => {
  // Termékek lekérése
  router.get('/termekek', productController.getAllProducts.bind(productController));
  
  // Felhasználói termékek lekérése
  router.get('/products', productController.getAllUserProducts.bind(productController));
  
  // Termék lekérése ID alapján
  router.get('/termekek/:id', productController.getProductById.bind(productController));
  
  // Felhasználói termék lekérése ID alapján
  router.get('/products/:id', productController.getUserProductById.bind(productController));
  
  // Új termék létrehozása
  router.post('/termekek/create', productController.createProduct.bind(productController));
  
  // Új felhasználói termék létrehozása
  router.post('/usertermekek', productController.createUserProduct.bind(productController));
  
  // Termék frissítése
  router.put('/termekek/:id', productController.updateProduct.bind(productController));
  
  // Felhasználói termék frissítése
  router.put('/products/:id', productController.updateUserProduct.bind(productController));
  
  // Termék törlése
  router.delete('/termekek/:id', productController.deleteProduct.bind(productController));
  
  // Felhasználói termék törlése
  router.delete('/products/:id', productController.deleteUserProduct.bind(productController));

  return router;
};
