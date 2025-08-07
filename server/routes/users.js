const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    קבלת פרופיל המשתמש הנוכחי
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    res.json({
      data: req.user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   PUT /api/users/profile
// @desc    עדכון פרופיל המשתמש
// @access  Private
router.put(
  "/profile",
  auth,
  [
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
        data: user,
      });
    } catch (error) {
      console.error("Update user profile error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   PUT /api/users/password
// @desc    שינוי סיסמה
// @access  Private
router.put(
  "/password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("סיסמה נוכחית היא שדה חובה"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("סיסמה חדשה חייבת להיות לפחות 6 תווים")
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage("סיסמה חדשה חייבת להכיל אותיות ומספרים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // מציאת המשתמש עם הסיסמה
      const user = await User.findById(req.user._id).select("+password");

      // בדיקת הסיסמה הנוכחית
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          message: "סיסמה נוכחית שגויה",
        });
      }

      // עדכון הסיסמה
      user.password = newPassword;
      await user.save();

      res.json({
        message: "סיסמה שונתה בהצלחה! 🔐",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   DELETE /api/users/account
// @desc    מחיקת חשבון המשתמש
// @access  Private
router.delete(
  "/account",
  auth,
  [
    body("password")
      .notEmpty()
      .withMessage("סיסמה היא שדה חובה לאישור מחיקת החשבון"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { password } = req.body;

      // מציאת המשתמש עם הסיסמה
      const user = await User.findById(req.user._id).select("+password");

      // בדיקת הסיסמה
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          message: "סיסמה שגויה",
        });
      }

      // מחיקת המשתמש
      await User.findByIdAndDelete(req.user._id);

      res.json({
        message: "חשבון נמחק בהצלחה. נתראה! 👋",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   GET /api/users/stats
// @desc    קבלת סטטיסטיקות המשתמש
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    // סטטיסטיקות בסיסיות
    const userStats = {
      memberSince: req.user.createdAt,
      lastLogin: req.user.lastLogin,
      totalLogins: req.user.lastLogin ? 1 : 0, // ניתן להרחיב בעתיד
      isActive: req.user.isActive,
    };

    res.json({
      data: userStats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

module.exports = router;
