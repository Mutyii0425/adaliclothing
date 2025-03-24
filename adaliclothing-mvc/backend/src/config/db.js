import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './backend.env' });

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'webshoppp',
      password: process.env.DB_PASS || 'Premo900',
      database: process.env.DB_NAME || 'webshoppp'
    });
    
    console.log('Connected to database');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export default createConnection;
