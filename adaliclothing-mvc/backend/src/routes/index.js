import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import userRoutes from './userRoutes.js';

export default (app, controllers) => {
  app.use(authRoutes(controllers.authController));
  app.use(productRoutes(controllers.productController));
  app.use(categoryRoutes(controllers.categoryController));
  app.use(orderRoutes(controllers.orderController));
  app.use(ratingRoutes(controllers.ratingController));
  app.use(userRoutes(controllers.userController));
};