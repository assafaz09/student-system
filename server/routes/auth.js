const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const {
  handleValidationErrors,
  commonValidations,
} = require("../middleware/validate");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    רישום משתמש חדש
// @access  Public
router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 2, max: 50 })
      .withMessage("שם חייב להיות בין 2 ל-50 תווים")
      .trim(),
    body("email")
      .isEmail()
      .withMessage("אנא הכנס אימייל תקין")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("סיסמה חייבת להיות לפחות 6 תווים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

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
  }
);

// @route   POST /api/auth/login
// @desc    התחברות משתמש
// @access  Public
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("אנא הכנס אימייל תקין")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("סיסמה היא שדה חובה"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

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
  }
);

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

// @route   PUT /api/auth/profile
// @desc    עדכון פרופיל המשתמש
// @access  Private
router.put(
  "/profile",
  [
    auth,
    body("name")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("שם חייב להיות בין 2 ל-50 תווים")
      .trim(),
    body("avatar")
      .optional()
      .isLength({ max: 10 })
      .withMessage("אווטר לא יכול להיות יותר מ-10 תווים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, avatar } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (avatar) updates.avatar = avatar;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({
        message: "פרופיל עודכן בהצלחה! ✨",
        user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    התנתקות (צד לקוח)
// @access  Private
router.post("/logout", auth, (req, res) => {
  res.json({
    message: "התנתקת בהצלחה",
  });
});

module.exports = router;
