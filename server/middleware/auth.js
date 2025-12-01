import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await db.getUserById(decoded.id);

        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};
