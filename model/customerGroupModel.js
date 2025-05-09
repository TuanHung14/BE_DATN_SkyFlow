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
      required: true,
    },
    max_age: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const CustomerGroup = mongoose.model("CustomerGroup", customerGroupSchema);

module.exports = CustomerGroup;
