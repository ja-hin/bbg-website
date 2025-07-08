import sql from 'mssql';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// SQL Server configuration
const config: sql.config = {
  server: '103.205.66.184',
  port: 2499,
  database: 'prexoDB',
  user: 'qo8yhe',
  password: 'tFbs89!0Ryyx1^90',
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true, // Set to true for self-signed certificates
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Create connection pool
export const pool = new sql.ConnectionPool(config);

// Initialize connection
let isConnected = false;

export const connectDB = async () => {
  if (!isConnected) {
    try {
      await pool.connect();
      console.log('Connected to SQL Server successfully');
      isConnected = true;
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }
  return pool;
};

// For Drizzle compatibility, we'll need to create a compatible connection
// Note: Drizzle ORM has limited SQL Server support, so we'll use raw SQL for now
export const db = {
  pool,
  connectDB,
  // Add query methods as needed
  query: async (text: string, params?: any[]) => {
    await connectDB();
    const request = pool.request();
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
    }
    return request.query(text);
  }
};