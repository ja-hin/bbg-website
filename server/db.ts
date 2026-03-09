import sql from 'mssql';

// SQL Server configuration - using environment variables
const config: sql.config = {
  server: process.env.SQL_SERVER_HOST || '103.205.66.184',
  port: parseInt(process.env.SQL_SERVER_PORT || '2499'),
  database: process.env.SQL_SERVER_DATABASE || 'bbgdb',
  user: process.env.SQL_SERVER_USER || 'bbguser2026',
  password: process.env.SQL_SERVER_PASSWORD || 'tFbs202689!0Ryyx1^9026',
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