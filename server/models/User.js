const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "שם הוא שדה חובה"],
      trim: true,
      maxlength: [50, "שם לא יכול להיות יותר מ-50 תווים"],
    },
    email: {
      type: String,
      required: [true, "אימייל הוא שדה חובה"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "אנא הכנס אימייל תקין",
      ],
    },
    password: {
      type: String,
      required: [true, "סיסמה היא שדה חובה"],
      minlength: [6, "סיסמה חייבת להיות לפחות 6 תווים"],
      select: false, // לא מחזיר סיסמה ב-queries
    },
    avatar: {
      type: String,
      default: "👤",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// הצפנת סיסמה לפני שמירה
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// השוואת סיסמאות
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// יצירת JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );
};

// הסתרת סיסמה ב-JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
