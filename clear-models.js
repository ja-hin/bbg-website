import sql from 'mssql';

const config = {
  server: '103.205.66.184',
  port: 2499,
  database: 'prexoDB',
  user: 'prexouser',
  password: 'Prexo123$',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function clearModels() {
  try {
    console.log('Connecting to SQL Server...');
    await sql.connect(config);
    
    console.log('Clearing all models...');
    const result = await sql.query('DELETE FROM models');
    console.log(`Deleted ${result.rowsAffected[0]} models`);
    
    console.log('Models cleared successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.close();
  }
}

clearModels();