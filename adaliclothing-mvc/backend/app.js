import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Middleware
import corsMiddleware from './src/middleware/corsMiddleware.js';
import errorHandler from './src/middleware/errorMiddleware.js';

// Database
import createConnection from './src/config/db.js';

// Models
import UserModel from './src/models/userModel.js';
import ProductModel from './src/models/productModel.js';
import CategoryModel from './src/models/categoryModel.js';
import OrderModel from './src/models/orderModel.js';
import RatingModel from './src/models/ratingModel.js';

// Controllers
import AuthController from './src/controllers/authController.js';
import ProductController from './src/controllers/productController.js';
import CategoryController from './src/controllers/categoryController.js';
import OrderController from './src/controllers/orderController.js';
import RatingController from './src/controllers/ratingController.js';
import UserController from './src/controllers/userController.js';

// Routes
import setupRoutes from './src/routes/index.js';

// Load environment variables
dotenv.config({ path: './backend.env' });

// Initialize Express app
const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database and models
const initializeApp = async () => {
  try {
    // Connect to database
    const db = await createConnection();
    
    // Initialize models
    const userModel = new UserModel(db);
    const productModel = new ProductModel(db);
    const categoryModel = new CategoryModel(db);
    const orderModel = new OrderModel(db);
    const ratingModel = new RatingModel(db);
    
    // Initialize controllers
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
    
    // Setup routes
    setupRoutes(app, controllers);
    
    // Home route
    app.get('/', (req, res) => {
      res.send('Adali Clothing API server is running');
    });
    
    // Error handling middleware
    app.use(errorHandler);
    
    // Check and fix database schema
    await checkAndFixDatabaseSchema(db);
    
    return app;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Check and fix database schema
async function checkAndFixDatabaseSchema(db) {
  try {
    // Check if reset_token column exists
    const [columns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_token'");
    
    if (columns.length === 0) {
      // Add reset_token column if it doesn't exist
      await db.execute("ALTER TABLE user ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL");
      console.log("Added reset_token column to user table");
    }
    
    // Check if reset_expires column exists
    const [expiryColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_expires'");
    
    if (expiryColumns.length === 0) {
      // Add reset_expires column if it doesn't exist
      await db.execute("ALTER TABLE user ADD COLUMN reset_expires DATETIME DEFAULT NULL");
      console.log("Added reset_expires column to user table");
    }
    
    // Clean up expired tokens
    await db.execute("UPDATE user SET reset_token = NULL, reset_expires = NULL WHERE reset_expires < NOW()");
    console.log("Cleaned up expired tokens");
    
    return true;
  } catch (error) {
    console.error("Database schema check error:", error);
    return false;
  }
}

export default initializeApp;
