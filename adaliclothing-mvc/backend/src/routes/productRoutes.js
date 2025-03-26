import express from 'express';

const router = express.Router();

export default (productController) => {

  router.get('/termekek', productController.getAllProducts.bind(productController));
  
 
  router.get('/products', productController.getAllUserProducts.bind(productController));
  
 
  router.get('/termekek/:id', productController.getProductById.bind(productController));
  
 
  router.get('/products/:id', productController.getUserProductById.bind(productController));
  
  
  router.post('/termekek/create', productController.createProduct.bind(productController));
  
  
  router.post('/usertermekek', productController.createUserProduct.bind(productController));
  

  router.put('/termekek/:id', productController.updateProduct.bind(productController));
  
 
  router.put('/products/:id', productController.updateUserProduct.bind(productController));
  
  
  router.delete('/termekek/:id', productController.deleteProduct.bind(productController));
  
 
  router.delete('/products/:id', productController.deleteUserProduct.bind(productController));

  return router;
};
