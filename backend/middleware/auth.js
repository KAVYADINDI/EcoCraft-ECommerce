import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT authentication middleware for all users
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });
      req.user = await User.findById(decoded.id);
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
// Simple admin check middleware (replace with real auth in production)
export function isAdmin(req, res, next) {
  console.log('User in isAdmin:', req.user); // Debug log
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
}
