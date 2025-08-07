const express = require("express");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    רישום משתמש חדש
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // בדיקות בסיסיות
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "כל השדות הם חובה",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "סיסמה חייבת להיות לפחות 6 תווים",
      });
    }

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "משתמש עם אימייל זה כבר קיים",
      });
    }

    // יצירת משתמש חדש
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // יצירת token
    const token = user.generateAuthToken();

    res.status(201).json({
      message: "משתמש נרשם בהצלחה! 🎉",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   POST /api/auth/login
// @desc    התחברות משתמש
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // בדיקות בסיסיות
    if (!email || !password) {
      return res.status(400).json({
        message: "אימייל וסיסמה הם חובה",
      });
    }

    // מציאת המשתמש עם הסיסמה
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "אימייל או סיסמה שגויים",
      });
    }

    // בדיקת סיסמה
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "אימייל או סיסמה שגויים",
      });
    }

    // עדכון זמן התחברות אחרונה
    user.lastLogin = new Date();
    await user.save();

    // יצירת token
    const token = user.generateAuthToken();

    res.json({
      message: "התחברת בהצלחה! 🎉",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   GET /api/auth/me
// @desc    קבלת פרטי המשתמש הנוכחי
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

module.exports = router;
