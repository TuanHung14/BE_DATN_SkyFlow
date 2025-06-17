const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: [true, "Email đã tồn tại!"],
      lowercase: true,
      validate: [validator.isEmail, "Email không hợp lệ"],
    },
    photo: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v);
        },
        message: (props) =>
          `${props.value} không phải là số điện thoại hợp lệ!`,
      },
    },
    dateOfBirth: {
      type: Date,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    memberShipPoints: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: Date,
    isAdmin: {
      type: Boolean,
      default: false,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isUpdatePassword: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// document middleware
// save chỉ có tác dụng với .save hay .create
// Mã hóa Password
userSchema.pre("save", async function (next) {
  //Dùng để check mật khẩu có thay đổi hay kh nếu không thay đổi thì next()
  if (!this.isModified("password") || !this.password) return next();

  this.password = await bcrypt.hashSync(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", function (next) {
  if (this.role === "user") return next();
  this.isAdmin = true;
  next();
});

userSchema.pre("save", function (next) {
  if (this.googleId && !this.password) {
    this.isUpdatePassword = false;
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.name) {
    this.name = `user-${Date.now()}`;
  }
  next();
});

userSchema.pre("save",async function (next) {
    if (!this.role) {
        const userRole = await mongoose.model('Role').findOne({ name: 'user' });
        if (userRole) {
            this.role = userRole._id;
        }
    }
    next();
})

userSchema.methods.correctPassword = async function (
  cadidatePassword,
  userPassword
) {
  return await bcrypt.compare(cadidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changePasswordAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changePasswordAtTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

//.save sẽ có 2 trường hợp
// 1. Nếu user mới, thì mặc định mongoose sẽ tự động check validation tất cả
// 2. Nếu user đã tồn tại, thì mongoose sẽ tự động update các trường đã đ��nh ngh��a trước đó

//Khi custom validator thì  dùng function với từ khóa this, nó sẽ chạy mỗi khi .save() được gọi, bất kể field nào bị modified.
