const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "משתמש הוא שדה חובה"],
    },
    learned: {
      type: String,
      required: [true, "תוכן הלמידה הוא שדה חובה"],
      trim: true,
      maxlength: [2000, "תוכן הלמידה לא יכול להיות יותר מ-2000 תווים"],
    },
    challenges: {
      type: String,
      required: [true, "אתגרים הם שדה חובה"],
      trim: true,
      maxlength: [2000, "תיאור האתגרים לא יכול להיות יותר מ-2000 תווים"],
    },
    timeSpent: {
      type: Number,
      required: [true, "זמן למידה הוא שדה חובה"],
      min: [1, "זמן למידה חייב להיות לפחות דקה אחת"],
      max: [1440, "זמן למידה לא יכול להיות יותר מ-24 שעות"],
    },
    mood: {
      type: String,
      enum: ["מעולה", "טוב", "בסדר", "לא טוב", "גרוע"],
      default: "בסדר",
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 20,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// אינדקסים לביצועים טובים יותר
journalEntrySchema.index({ user: 1, createdAt: -1 });
journalEntrySchema.index({ user: 1, date: -1 });

// וירטואל פילד לתאריך
journalEntrySchema.virtual("date").get(function () {
  return this.createdAt.toISOString().split("T")[0];
});

// וירטואל פילד לסטטיסטיקות
journalEntrySchema.virtual("stats").get(function () {
  return {
    wordCount:
      this.learned.split(" ").length + this.challenges.split(" ").length,
    timeInHours: (this.timeSpent / 60).toFixed(1),
  };
});

// הגדרת JSON options
journalEntrySchema.set("toJSON", { virtuals: true });
journalEntrySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
