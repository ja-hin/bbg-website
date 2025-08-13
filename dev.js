#!/usr/bin/env node

// Simple dev script to start the BBG application
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting BBG application...');

// Start the server with tsx
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down...');
  server.kill('SIGTERM');
});