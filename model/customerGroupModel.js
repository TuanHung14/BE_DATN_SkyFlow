const mongoose = require("mongoose");

const customerGroupSchema = new mongoose.Schema(
  {
    age_type: {
      type: String,
      enum: ["child", "teen", "adult", "senior"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    min_age: {
      type: Number,
      min: [0, "min_age must be >= 0"],
      required: true,
    },
    max_age: {
      type: Number,
      required: true,
      min: [0, "max_age must be >= 0"],
      validate: {
        validator: function (value) {
          return value > this.min_age;
        },
        message: "max_age must be greater than min_age",
      },
    },
  },
  { timestamps: true }
);

const CustomerGroup = mongoose.model("CustomerGroup", customerGroupSchema);

module.exports = CustomerGroup;
