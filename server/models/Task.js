const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "משתמש הוא שדה חובה"],
    },
    title: {
      type: String,
      required: [true, "כותרת המשימה היא שדה חובה"],
      trim: true,
      maxlength: [100, "כותרת המשימה לא יכולה להיות יותר מ-100 תווים"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "תיאור המשימה לא יכול להיות יותר מ-1000 תווים"],
    },
    priority: {
      type: String,
      enum: ["נמוך", "בינוני", "גבוה", "דחוף"],
      default: "בינוני",
    },
    status: {
      type: String,
      enum: ["לעשות", "בתהליך", "הושלם", "בוטל"],
      default: "לעשות",
    },
    category: {
      type: String,
      enum: ["עבודה", "לימודים", "אישי", "בריאות", "אחר"],
      default: "אישי",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= new Date();
        },
        message: "תאריך יעד לא יכול להיות בעבר",
      },
    },
    completedAt: {
      type: Date,
    },
    estimatedTime: {
      type: Number, // בדקות
      min: [1, "זמן משוער חייב להיות לפחות דקה אחת"],
      max: [1440, "זמן משוער לא יכול להיות יותר מ-24 שעות"],
    },
    actualTime: {
      type: Number, // בדקות
      min: [0, "זמן בפועל לא יכול להיות שלילי"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 20,
      },
    ],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ["יומי", "שבועי", "חודשי"],
      required: function () {
        return this.isRecurring;
      },
    },
  },
  {
    timestamps: true,
  }
);

// אינדקסים לביצועים טובים יותר
taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ user: 1, priority: 1, createdAt: -1 });

// וירטואל פילד לסטטוס
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === "הושלם") return false;
  return new Date() > this.dueDate;
});

// וירטואל פילד לזמן
taskSchema.virtual("timeDifference").get(function () {
  if (!this.estimatedTime || !this.actualTime) return null;
  return this.actualTime - this.estimatedTime;
});

// Middleware לעדכון תאריך השלמה
taskSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "הושלם" &&
    !this.completedAt
  ) {
    this.completedAt = new Date();
  }
  next();
});

// הגדרת JSON options
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
