const express = require("express");
const { body, query } = require("express-validator");
const Task = require("../models/Task");
const { auth } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

// @route   GET /api/tasks
// @desc    קבלת כל המשימות של המשתמש
// @access  Private
router.get(
  "/",
  auth,
  [
    query("status")
      .optional()
      .isIn(["לעשות", "בתהליך", "הושלם", "בוטל"])
      .withMessage("סטטוס חייב להיות אחד מהערכים המותרים"),
    query("priority")
      .optional()
      .isIn(["נמוך", "בינוני", "גבוה", "דחוף"])
      .withMessage("עדיפות חייב להיות אחד מהערכים המותרים"),
    query("category")
      .optional()
      .isIn(["עבודה", "לימודים", "אישי", "בריאות", "אחר"])
      .withMessage("קטגוריה חייב להיות אחד מהערכים המותרים"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("מספר עמוד חייב להיות מספר חיובי"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("מספר משימות חייב להיות בין 1 ל-100"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { status, priority, category, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const filter = { user: req.user._id };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (category) filter.category = category;

      const tasks = await Task.find(filter)
        .sort({ priority: -1, dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Task.countDocuments(filter);

      res.json({
        data: tasks,
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
      console.error("Get tasks error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   POST /api/tasks
// @desc    יצירת משימה חדשה
// @access  Private
router.post(
  "/",
  auth,
  [
    body("title")
      .isLength({ min: 1, max: 100 })
      .withMessage("כותרת המשימה חייב להיות בין 1 ל-100 תווים")
      .trim(),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("תיאור המשימה לא יכול להיות יותר מ-1000 תווים")
      .trim(),
    body("priority")
      .optional()
      .isIn(["נמוך", "בינוני", "גבוה", "דחוף"])
      .withMessage("עדיפות חייב להיות אחד מהערכים המותרים"),
    body("category")
      .optional()
      .isIn(["עבודה", "לימודים", "אישי", "בריאות", "אחר"])
      .withMessage("קטגוריה חייב להיות אחד מהערכים המותרים"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("תאריך יעד חייב להיות בפורמט תקין"),
    body("estimatedTime")
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage("זמן משוער חייב להיות בין 1 ל-1440 דקות"),
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
        title,
        description,
        priority = "בינוני",
        category = "אישי",
        dueDate,
        estimatedTime,
        tags = [],
        isRecurring = false,
        recurringPattern,
      } = req.body;

      const task = new Task({
        user: req.user._id,
        title,
        description,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedTime,
        tags,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : undefined,
      });

      await task.save();

      res.status(201).json({
        message: "משימה נוצרה בהצלחה! ✅",
        data: task,
      });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   GET /api/tasks/:id
// @desc    קבלת משימה ספציפית
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "משימה לא נמצאה",
      });
    }

    res.json({
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    עדכון משימה
// @access  Private
router.put(
  "/:id",
  auth,
  [
    body("title")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("כותרת המשימה חייב להיות בין 1 ל-100 תווים")
      .trim(),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("תיאור המשימה לא יכול להיות יותר מ-1000 תווים")
      .trim(),
    body("priority")
      .optional()
      .isIn(["נמוך", "בינוני", "גבוה", "דחוף"])
      .withMessage("עדיפות חייב להיות אחד מהערכים המותרים"),
    body("status")
      .optional()
      .isIn(["לעשות", "בתהליך", "הושלם", "בוטל"])
      .withMessage("סטטוס חייב להיות אחד מהערכים המותרים"),
    body("category")
      .optional()
      .isIn(["עבודה", "לימודים", "אישי", "בריאות", "אחר"])
      .withMessage("קטגוריה חייב להיות אחד מהערכים המותרים"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("תאריך יעד חייב להיות בפורמט תקין"),
    body("estimatedTime")
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage("זמן משוער חייב להיות בין 1 ל-1440 דקות"),
    body("actualTime")
      .optional()
      .isInt({ min: 0 })
      .withMessage("זמן בפועל לא יכול להיות שלילי"),
    body("tags").optional().isArray().withMessage("תגיות חייבות להיות מערך"),
    body("tags.*")
      .optional()
      .isLength({ max: 20 })
      .withMessage("כל תג חייב להיות עד 20 תווים"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const task = await Task.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({
          message: "משימה לא נמצאה",
        });
      }

      res.json({
        message: "משימה עודכנה בהצלחה! ✨",
        data: task,
      });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({
        message: "שגיאה בשרת. אנא נסה שוב.",
      });
    }
  }
);

// @route   DELETE /api/tasks/:id
// @desc    מחיקת משימה
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "משימה לא נמצאה",
      });
    }

    res.json({
      message: "משימה נמחקה בהצלחה! 🗑️",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    החלפת סטטוס השלמה של משימה
// @access  Private
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "משימה לא נמצאה",
      });
    }

    task.status = task.status === "הושלם" ? "לעשות" : "הושלם";
    if (task.status === "הושלם") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    res.json({
      message: `משימה ${
        task.status === "הושלם" ? "הושלמה" : "נפתחה מחדש"
      } בהצלחה!`,
      data: task,
    });
  } catch (error) {
    console.error("Toggle task error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

// @route   GET /api/tasks/stats/summary
// @desc    קבלת סיכום סטטיסטיקות המשימות
// @access  Private
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.user._id });
    const completedTasks = await Task.countDocuments({
      user: req.user._id,
      status: "הושלם",
    });
    const pendingTasks = await Task.countDocuments({
      user: req.user._id,
      status: { $in: ["לעשות", "בתהליך"] },
    });

    const overdueTasks = await Task.countDocuments({
      user: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: "הושלם" },
    });

    const priorityStats = await Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categoryStats = await Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate:
          totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
        priorityStats,
        categoryStats,
      },
    });
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({
      message: "שגיאה בשרת. אנא נסה שוב.",
    });
  }
});

module.exports = router;
