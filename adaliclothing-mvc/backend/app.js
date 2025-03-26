import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


import corsMiddleware from './src/middleware/corsMiddleware.js';
import errorHandler from './src/middleware/errorMiddleware.js';


import createConnection from './src/config/db.js';


import UserModel from './src/models/userModel.js';
import ProductModel from './src/models/productModel.js';
import CategoryModel from './src/models/categoryModel.js';
import OrderModel from './src/models/orderModel.js';
import RatingModel from './src/models/ratingModel.js';


import AuthController from './src/controllers/authController.js';
import ProductController from './src/controllers/productController.js';
import CategoryController from './src/controllers/categoryController.js';
import OrderController from './src/controllers/orderController.js';
import RatingController from './src/controllers/ratingController.js';
import UserController from './src/controllers/userController.js';


import setupRoutes from './src/routes/index.js';


dotenv.config({ path: './backend.env' });


const app = express();


app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const initializeApp = async () => {
  try {
    
    const db = await createConnection();
    
    
    const userModel = new UserModel(db);
    const productModel = new ProductModel(db);
    const categoryModel = new CategoryModel(db);
    const orderModel = new OrderModel(db);
    const ratingModel = new RatingModel(db);
    
    
    const authController = new AuthController(userModel);
    const productController = new ProductController(productModel);
    const categoryController = new CategoryController(categoryModel);
    const orderController = new OrderController(orderModel);
    const ratingController = new RatingController(ratingModel);
    const userController = new UserController(userModel);
    
    const controllers = {
      authController,
      productController,
      categoryController,
      orderController,
      ratingController,
      userController
    };
    
   
    setupRoutes(app, controllers);
    
    
    app.get('/', (req, res) => {
      res.send('Adali Clothing API server is running');
    });
    
    
    app.use(errorHandler);
    
   
    await checkAndFixDatabaseSchema(db);
    
    return app;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};


async function checkAndFixDatabaseSchema(db) {
  try {
   
    const [columns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_token'");
    
    if (columns.length === 0) {
      
      await db.execute("ALTER TABLE user ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL");
      console.log("Added reset_token column to user table");
    }
    
    
    const [expiryColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_expires'");
    
    if (expiryColumns.length === 0) {
      
      await db.execute("ALTER TABLE user ADD COLUMN reset_expires DATETIME DEFAULT NULL");
      console.log("Added reset_expires column to user table");
    }
    

    await db.execute("UPDATE user SET reset_token = NULL, reset_expires = NULL WHERE reset_expires < NOW()");
    console.log("Cleaned up expired tokens");
    
    return true;
  } catch (error) {
    console.error("Database schema check error:", error);
    return false;
  }
}

export default initializeApp;
