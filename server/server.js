import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();
console.log('Environment loaded');

// Import routes
console.log('Importing routes...');
import userRoutes from './routes/users.js';
import serviceRoutes from './routes/services.js';
import barberRoutes from './routes/barbers.js';
import bookingRoutes from './routes/bookings.js';
import contactRoutes from './routes/contact.js';
import messageRoutes from './routes/messages.js';
console.log('Routes imported');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
console.log(`Starting server on port ${PORT}`);

// Middleware
console.log('Setting up middleware...');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist
console.log('Setting up static files...');
app.use('/images', express.static(path.join(__dirname, '../dist/images')));
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

console.log('Starting server...');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});