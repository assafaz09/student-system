const { validationResult } = require("express-validator");

// Middleware לטיפול בשגיאות וולידציה
const handleValidationErrors = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      }));

      return res.status(400).json({
        message: "שגיאות וולידציה",
        errors: errorMessages,
      });
    }

    next();
  } catch (error) {
    console.error("Validation middleware error:", error);
    next();
  }
};

// וולידציות נפוצות
const commonValidations = {
  // וולידציה למייל
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "אנא הכנס אימייל תקין",
    },
    normalizeEmail: true,
  },

  // וולידציה לסיסמה
  password: {
    in: ["body"],
    isLength: {
      options: { min: 6 },
      errorMessage: "סיסמה חייבת להיות לפחות 6 תווים",
    },
    matches: {
      options: /^(?=.*[a-zA-Z])(?=.*\d)/,
      errorMessage: "סיסמה חייבת להכיל אותיות ומספרים",
    },
  },

  // וולידציה לשם
  name: {
    in: ["body"],
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: "שם חייב להיות בין 2 ל-50 תווים",
    },
    trim: true,
  },

  // וולידציה לטקסט
  text: {
    in: ["body"],
    isLength: {
      options: { min: 1, max: 2000 },
      errorMessage: "טקסט חייב להיות בין 1 ל-2000 תווים",
    },
    trim: true,
  },

  // וולידציה למספר חיובי
  positiveNumber: {
    in: ["body"],
    isInt: {
      options: { min: 1 },
      errorMessage: "ערך חייב להיות מספר חיובי",
    },
  },

  // וולידציה לאחוזים
  percentage: {
    in: ["body"],
    isInt: {
      options: { min: 0, max: 100 },
      errorMessage: "אחוז חייב להיות בין 0 ל-100",
    },
  },

  // וולידציה לתאריך
  date: {
    in: ["body"],
    isISO8601: {
      errorMessage: "תאריך חייב להיות בפורמט תקין",
    },
  },

  // וולידציה ל-URL
  url: {
    in: ["body"],
    isURL: {
      options: { protocols: ["http", "https"] },
      errorMessage: "URL חייב להתחיל ב-http או https",
    },
  },
};

module.exports = {
  handleValidationErrors,
  commonValidations,
};
