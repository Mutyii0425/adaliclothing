import express from 'express';

const router = express.Router();

export default (orderController) => {
  // Vevő létrehozása
  router.post('/vevo/create', orderController.createCustomer.bind(orderController));
  
  // Rendelés létrehozása
  router.post('/orders/create', orderController.createOrder.bind(orderController));
  
  // Rendelési statisztikák lekérése
  router.get('/api/order-stats/:userId', orderController.getOrderStats.bind(orderController));
  
  // Rendelési statisztikák frissítése
  router.post('/api/update-order-stats', orderController.updateOrderStats.bind(orderController));
  
  // Rendelés visszaigazolás küldése
  router.post('/send-confirmation', orderController.sendConfirmation.bind(orderController));

  return router;
};
