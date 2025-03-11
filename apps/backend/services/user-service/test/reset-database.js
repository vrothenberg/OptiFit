/**
 * Database Reset Script
 * 
 * This script helps reset the database and recreate it with the correct table names.
 * It's useful after making changes to entity table names.
 * 
 * Usage:
 * node reset-database.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function resetDatabase() {
  console.log('Starting database reset process...');
  
  // Get database connection info from environment variables
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 5432;
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPass = process.env.DB_PASS || 'postgres';
  const dbName = process.env.DB_NAME || 'optifit';
  
  console.log(`Database: ${dbName} on ${dbHost}:${dbPort}`);
  
  // Connect to PostgreSQL server (not to the specific database)
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPass,
    database: 'postgres' // Connect to default postgres database
  });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');
    
    // Terminate all connections to the database
    console.log(`Terminating all connections to ${dbName}...`);
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbName}'
        AND pid <> pg_backend_pid();
    `);
    
    // Drop the database if it exists
    console.log(`Dropping database ${dbName} if it exists...`);
    await client.query(`DROP DATABASE IF EXISTS ${dbName};`);
    
    // Create the database again
    console.log(`Creating database ${dbName}...`);
    await client.query(`CREATE DATABASE ${dbName};`);
    
    console.log('Database reset complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your NestJS application');
    console.log('2. The application will automatically create the tables with the correct names');
    console.log('3. Try registering a user again');
    console.log('');
    console.log('To verify the tables were created correctly, run:');
    console.log(`psql -U ${dbUser} -d ${dbName} -c "\\dt"`);
    
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();
