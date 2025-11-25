import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Authenticating token:', token ? 'present' : 'missing');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log('Decoded token:', decoded);

    // Get user from database
    const user = db.getUserById(decoded.id);
    console.log('User found in DB:', user ? user.email : 'no');
    if (!user) {
      console.log('User not found for id:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  });
};