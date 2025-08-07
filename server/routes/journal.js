const express = require("express");
const { body, query } = require("express-validator");
const JournalEntry = require("../models/JournalEntry");
const { auth } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

// @route   GET /api/journal
// @desc    קבלת כל רשומות היומן של המשתמש
// @access  Private
router.get(
  "/",
  auth,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("מספר עמוד חייב להיות מספר חיובי"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("מספר רשומות חייב להיות בין 1 ל-100"),
    query("sort")
      .optional()
      .isIn(["newest", "oldest"])
      .withMessage("סדר מיון חייב להיות newest או oldest"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const sort = req.query.sort || "newest";
      const skip = (page - 1) * limit;

      const sortOption =
        sort === "newest" ? { createdAt: -1 } : { createdAt: 1 };

      const entries = await JournalEntry.find({ user: req.user._id })
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

      const total = await JournalEntry.countDocuments({ user: req.user._id });

      res.json({
        data: entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get journal entries error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   POST /api/journal
// @desc    יצירת רשומת יומן חדשה
// @access  Private
router.post(
  "/",
  auth,
  [
    body("learned")
      .isLength({ min: 1, max: 2000 })
      .withMessage("תוכן הלמידה חייב להיות בין 1 ל-2000 תווים")
      .trim(),
    body("challenges")
      .isLength({ min: 1, max: 2000 })
      .withMessage("תיאור האתגרים חייב להיות בין 1 ל-2000 תווים")
      .trim(),
    body("timeSpent")
      .isInt({ min: 1, max: 1440 })
      .withMessage("זמן למידה חייב להיות בין 1 ל-1440 דקות"),
    body("mood")
      .optional()
      .isIn(["מעולה", "טוב", "בסדר", "לא טוב", "גרוע"])
      .withMessage("מצב רוח חייב להיות אחד מהערכים המותרים"),
    body("tags").optional().isArray().withMessage("תגיות חייבות להיות מערך"),
    body("tags.*")
      .optional()
      .isLength({ max: 20 })
      .withMessage("כל תג חייב להיות עד 20 תווים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { learned, challenges, timeSpent, mood, tags, isPublic } = req.body;

      const entry = new JournalEntry({
        user: req.user._id,
        learned,
        challenges,
        timeSpent,
        mood: mood || "בסדר",
        tags: tags || [],
        isPublic: isPublic || false,
      });

      await entry.save();

      res.status(201).json({
        message: "רשומת יומן נשמרה בהצלחה! 📝",
        data: entry,
      });
    } catch (error) {
      console.error("Create journal entry error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   GET /api/journal/:id
// @desc    קבלת רשומת יומן ספציפית
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "רשומת יומן לא נמצאה",
      });
    }

    res.json({
      data: entry,
    });
  } catch (error) {
    console.error("Get journal entry error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   PUT /api/journal/:id
// @desc    עדכון רשומת יומן
// @access  Private
router.put(
  "/:id",
  auth,
  [
    body("learned")
      .optional()
      .isLength({ min: 1, max: 2000 })
      .withMessage("תוכן הלמידה חייב להיות בין 1 ל-2000 תווים")
      .trim(),
    body("challenges")
      .optional()
      .isLength({ min: 1, max: 2000 })
      .withMessage("תיאור האתגרים חייב להיות בין 1 ל-2000 תווים")
      .trim(),
    body("timeSpent")
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage("זמן למידה חייב להיות בין 1 ל-1440 דקות"),
    body("mood")
      .optional()
      .isIn(["מעולה", "טוב", "בסדר", "לא טוב", "גרוע"])
      .withMessage("מצב רוח חייב להיות אחד מהערכים המותרים"),
    body("tags").optional().isArray().withMessage("תגיות חייבות להיות מערך"),
    body("tags.*")
      .optional()
      .isLength({ max: 20 })
      .withMessage("כל תג חייב להיות עד 20 תווים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const entry = await JournalEntry.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!entry) {
        return res.status(404).json({
          message: "רשומת יומן לא נמצאה",
        });
      }

      res.json({
        message: "רשומת יומן עודכנה בהצלחה! ✨",
        data: entry,
      });
    } catch (error) {
      console.error("Update journal entry error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   DELETE /api/journal/:id
// @desc    מחיקת רשומת יומן
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "רשומת יומן לא נמצאה",
      });
    }

    res.json({
      message: "רשומת יומן נמחקה בהצלחה! 🗑️",
    });
  } catch (error) {
    console.error("Delete journal entry error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   GET /api/journal/stats/summary
// @desc    קבלת סיכום סטטיסטיקות היומן
// @access  Private
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const totalEntries = await JournalEntry.countDocuments({
      user: req.user._id,
    });
    const totalTime = await JournalEntry.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$timeSpent" } } },
    ]);

    const moodStats = await JournalEntry.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentEntries = await JournalEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      data: {
        totalEntries,
        totalTimeMinutes: totalTime[0]?.total || 0,
        totalTimeHours: ((totalTime[0]?.total || 0) / 60).toFixed(1),
        moodStats,
        recentEntries,
      },
    });
  } catch (error) {
    console.error("Get journal stats error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

module.exports = router;
