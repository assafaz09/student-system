const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // בדיקת token מה-header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'גישה נדרשת. אנא התחבר מחדש.' 
      });
    }

    // אימות ה-token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // מציאת המשתמש
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'משתמש לא נמצא. אנא התחבר מחדש.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'חשבון המשתמש מושבת. אנא פנה לתמיכה.' 
      });
    }

    // הוספת המשתמש ל-request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token לא תקין. אנא התחבר מחדש.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token פג תוקף. אנא התחבר מחדש.' 
      });
    }
    
    res.status(500).json({ 
      message: 'שגיאה בשרת. אנא נסה שוב.' 
    });
  }
};

// Middleware אופציונלי - לא דורש אימות אבל מוסיף משתמש אם יש
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // מתעלם משגיאות ב-optional auth
    next();
  }
};

module.exports = { auth, optionalAuth };
