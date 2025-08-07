const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'משתמש הוא שדה חובה']
  },
  name: {
    type: String,
    required: [true, 'שם הקורס הוא שדה חובה'],
    trim: true,
    maxlength: [100, 'שם הקורס לא יכול להיות יותר מ-100 תווים']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'תיאור הקורס לא יכול להיות יותר מ-500 תווים']
  },
  duration: {
    type: Number, // בדקות
    required: [true, 'משך הקורס הוא שדה חובה'],
    min: [1, 'משך הקורס חייב להיות לפחות דקה אחת'],
    max: [10080, 'משך הקורס לא יכול להיות יותר מ-7 ימים']
  },
  type: {
    type: String,
    enum: ['כללי', 'תכנות', 'עיצוב', 'שיווק', 'ניהול', 'אחר'],
    default: 'כללי'
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'התקדמות לא יכולה להיות שלילית'],
    max: [100, 'התקדמות לא יכולה להיות יותר מ-100%']
  },
  status: {
    type: String,
    enum: ['לא התחלתי', 'בתהליך', 'הושלם', 'השהיה'],
    default: 'לא התחלתי'
  },
  difficulty: {
    type: String,
    enum: ['מתחיל', 'בינוני', 'מתקדם', 'מומחה'],
    default: 'מתחיל'
  },
  platform: {
    type: String,
    trim: true,
    maxlength: [50, 'שם הפלטפורמה לא יכול להיות יותר מ-50 תווים']
  },
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // לא חובה
        return /^https?:\/\/.+/.test(value);
      },
      message: 'URL חייב להתחיל ב-http או https'
    }
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value || !this.startDate) return true;
        return value >= this.startDate;
      },
      message: 'תאריך סיום לא יכול להיות לפני תאריך התחלה'
    }
  },
  rating: {
    type: Number,
    min: [1, 'דירוג חייב להיות לפחות 1'],
    max: [5, 'דירוג לא יכול להיות יותר מ-5']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'הערות לא יכולות להיות יותר מ-1000 תווים']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// אינדקסים לביצועים טובים יותר
courseSchema.index({ user: 1, status: 1, createdAt: -1 });
courseSchema.index({ user: 1, type: 1, progress: -1 });

// וירטואל פילד לזמן
courseSchema.virtual('durationInHours').get(function() {
  return (this.duration / 60).toFixed(1);
});

// וירטואל פילד לזמן נותר
courseSchema.virtual('remainingTime').get(function() {
  if (this.progress >= 100) return 0;
  return Math.round(this.duration * (1 - this.progress / 100));
});

// וירטואל פילד לסטטוס
courseSchema.virtual('isCompleted').get(function() {
  return this.progress >= 100 || this.status === 'הושלם';
});

// Middleware לעדכון סטטוס
courseSchema.pre('save', function(next) {
  if (this.progress >= 100 && this.status !== 'הושלם') {
    this.status = 'הושלם';
    if (!this.endDate) {
      this.endDate = new Date();
    }
  } else if (this.progress > 0 && this.status === 'לא התחלתי') {
    this.status = 'בתהליך';
  }
  next();
});

// הגדרת JSON options
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
