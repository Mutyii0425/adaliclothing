import express from 'express';

const router = express.Router();

export default (orderController) => {

  router.post('/vevo/create', orderController.createCustomer.bind(orderController));
  
 
  router.post('/orders/create', orderController.createOrder.bind(orderController));
  

  router.get('/api/order-stats/:userId', orderController.getOrderStats.bind(orderController));
  
  
  router.post('/api/update-order-stats', orderController.updateOrderStats.bind(orderController));
  
  
  router.post('/send-confirmation', orderController.sendConfirmation.bind(orderController));

  return router;
};
