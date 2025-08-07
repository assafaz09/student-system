const express = require("express");
const { body, query } = require("express-validator");
const Course = require("../models/Course");
const { auth } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

// @route   GET /api/courses
// @desc    קבלת כל הקורסים של המשתמש
// @access  Private
router.get(
  "/",
  auth,
  [
    query("status")
      .optional()
      .isIn(["לא התחלתי", "בתהליך", "הושלם", "השהיה"])
      .withMessage("סטטוס חייב להיות אחד מהערכים המותרים"),
    query("type")
      .optional()
      .isIn(["כללי", "תכנות", "עיצוב", "שיווק", "ניהול", "אחר"])
      .withMessage("סוג חייב להיות אחד מהערכים המותרים"),
    query("difficulty")
      .optional()
      .isIn(["מתחיל", "בינוני", "מתקדם", "מומחה"])
      .withMessage("רמת קושי חייב להיות אחד מהערכים המותרים"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("מספר עמוד חייב להיות מספר חיובי"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("מספר קורסים חייב להיות בין 1 ל-100"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { status, type, difficulty, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const filter = { user: req.user._id };
      if (status) filter.status = status;
      if (type) filter.type = type;
      if (difficulty) filter.difficulty = difficulty;

      const courses = await Course.find(filter)
        .sort({ progress: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Course.countDocuments(filter);

      res.json({
        data: courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get courses error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   POST /api/courses
// @desc    יצירת קורס חדש
// @access  Private
router.post(
  "/",
  auth,
  [
    body("name")
      .isLength({ min: 1, max: 100 })
      .withMessage("שם הקורס חייב להיות בין 1 ל-100 תווים")
      .trim(),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("תיאור הקורס לא יכול להיות יותר מ-500 תווים")
      .trim(),
    body("duration")
      .isInt({ min: 1, max: 10080 })
      .withMessage("משך הקורס חייב להיות בין 1 ל-10080 דקות"),
    body("type")
      .optional()
      .isIn(["כללי", "תכנות", "עיצוב", "שיווק", "ניהול", "אחר"])
      .withMessage("סוג חייב להיות אחד מהערכים המותרים"),
    body("difficulty")
      .optional()
      .isIn(["מתחיל", "בינוני", "מתקדם", "מומחה"])
      .withMessage("רמת קושי חייב להיות אחד מהערכים המותרים"),
    body("platform")
      .optional()
      .isLength({ max: 50 })
      .withMessage("שם הפלטפורמה לא יכול להיות יותר מ-50 תווים")
      .trim(),
    body("url")
      .optional()
      .isURL({ protocols: ["http", "https"] })
      .withMessage("URL חייב להתחיל ב-http או https"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("תאריך התחלה חייב להיות בפורמט תקין"),
    body("tags").optional().isArray().withMessage("תגיות חייבות להיות מערך"),
    body("tags.*")
      .optional()
      .isLength({ max: 20 })
      .withMessage("כל תג חייב להיות עד 20 תווים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const {
        name,
        description,
        duration,
        type = "כללי",
        difficulty = "מתחיל",
        platform,
        url,
        startDate,
        tags = [],
        isPublic = false,
      } = req.body;

      const course = new Course({
        user: req.user._id,
        name,
        description,
        duration,
        type,
        difficulty,
        platform,
        url,
        startDate: startDate ? new Date(startDate) : null,
        tags,
        isPublic,
      });

      await course.save();

      res.status(201).json({
        message: "קורס נוסף בהצלחה! 🎓",
        data: course,
      });
    } catch (error) {
      console.error("Create course error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   GET /api/courses/:id
// @desc    קבלת קורס ספציפי
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "קורס לא נמצא",
      });
    }

    res.json({
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    עדכון קורס
// @access  Private
router.put(
  "/:id",
  auth,
  [
    body("name")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("שם הקורס חייב להיות בין 1 ל-100 תווים")
      .trim(),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("תיאור הקורס לא יכול להיות יותר מ-500 תווים")
      .trim(),
    body("duration")
      .optional()
      .isInt({ min: 1, max: 10080 })
      .withMessage("משך הקורס חייב להיות בין 1 ל-10080 דקות"),
    body("progress")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("התקדמות חייב להיות בין 0 ל-100"),
    body("status")
      .optional()
      .isIn(["לא התחלתי", "בתהליך", "הושלם", "השהיה"])
      .withMessage("סטטוס חייב להיות אחד מהערכים המותרים"),
    body("type")
      .optional()
      .isIn(["כללי", "תכנות", "עיצוב", "שיווק", "ניהול", "אחר"])
      .withMessage("סוג חייב להיות אחד מהערכים המותרים"),
    body("difficulty")
      .optional()
      .isIn(["מתחיל", "בינוני", "מתקדם", "מומחה"])
      .withMessage("רמת קושי חייב להיות אחד מהערכים המותרים"),
    body("platform")
      .optional()
      .isLength({ max: 50 })
      .withMessage("שם הפלטפורמה לא יכול להיות יותר מ-50 תווים")
      .trim(),
    body("url")
      .optional()
      .isURL({ protocols: ["http", "https"] })
      .withMessage("URL חייב להתחיל ב-http או https"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("תאריך התחלה חייב להיות בפורמט תקין"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("תאריך סיום חייב להיות בפורמט תקין"),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("דירוג חייב להיות בין 1 ל-5"),
    body("notes")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("הערות לא יכולות להיות יותר מ-1000 תווים")
      .trim(),
    body("tags").optional().isArray().withMessage("תגיות חייבות להיות מערך"),
    body("tags.*")
      .optional()
      .isLength({ max: 20 })
      .withMessage("כל תג חייב להיות עד 20 תווים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const course = await Course.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!course) {
        return res.status(404).json({
          message: "קורס לא נמצא",
        });
      }

      res.json({
        message: "קורס עודכן בהצלחה! ✨",
        data: course,
      });
    } catch (error) {
      console.error("Update course error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   DELETE /api/courses/:id
// @desc    מחיקת קורס
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "קורס לא נמצא",
      });
    }

    res.json({
      message: "קורס נמחק בהצלחה! 🗑️",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   PATCH /api/courses/:id/progress
// @desc    עדכון התקדמות קורס
// @access  Private
router.patch(
  "/:id/progress",
  auth,
  [
    body("progress")
      .isInt({ min: 0, max: 100 })
      .withMessage("התקדמות חייב להיות בין 0 ל-100"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { progress } = req.body;

      const course = await Course.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!course) {
        return res.status(404).json({
          message: "קורס לא נמצא",
        });
      }

      course.progress = progress;

      // עדכון סטטוס אוטומטי
      if (progress >= 100) {
        course.status = "הושלם";
        course.endDate = new Date();
      } else if (progress > 0 && course.status === "לא התחלתי") {
        course.status = "בתהליך";
      }

      await course.save();

      res.json({
        message: "התקדמות הקורס עודכנה בהצלחה! 📈",
        data: course,
      });
    } catch (error) {
      console.error("Update course progress error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   GET /api/courses/stats/summary
// @desc    קבלת סיכום סטטיסטיקות הקורסים
// @access  Private
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments({ user: req.user._id });
    const completedCourses = await Course.countDocuments({
      user: req.user._id,
      status: "הושלם",
    });
    const inProgressCourses = await Course.countDocuments({
      user: req.user._id,
      status: "בתהליך",
    });

    const totalTime = await Course.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]);

    const typeStats = await Course.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const difficultyStats = await Course.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const avgProgress = await Course.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, avg: { $avg: "$progress" } } },
    ]);

    res.json({
      data: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalTimeMinutes: totalTime[0]?.total || 0,
        totalTimeHours: ((totalTime[0]?.total || 0) / 60).toFixed(1),
        completionRate:
          totalCourses > 0
            ? ((completedCourses / totalCourses) * 100).toFixed(1)
            : 0,
        averageProgress: avgProgress[0]?.avg
          ? avgProgress[0].avg.toFixed(1)
          : 0,
        typeStats,
        difficultyStats,
      },
    });
  } catch (error) {
    console.error("Get course stats error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

module.exports = router;
