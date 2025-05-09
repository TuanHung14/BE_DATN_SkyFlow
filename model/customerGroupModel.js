const mongoose = require("mongoose");

const customerGroupSchema = new mongoose.Schema(
  {
    ageType: {
      type: String,
      enum: ["child", "teen", "adult", "senior"],
      required: [true, "Không được để trống"],
    },
    description: {
      type: String,
      required: [true, "Không được để trống"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    minAge: {
      type: Number,
      min: [0, "Tuổi không được nhỏ hơn 0"],
      required: [true, "Không được để trống"],
    },
    maxAge: {
      type: Number,
      required: [true, "Không được để trống"],
      min: [0, "Tuổi không được nhỏ hơn 0"],
      validate: {
        validator: function (value) {
          return value > this.min_age;
        },
        message: "Không được nhỏ hơn tuổi tối thiểu",
      },
    },
  },
  { timestamps: true }
);

const CustomerGroup = mongoose.model("CustomerGroup", customerGroupSchema);

module.exports = CustomerGroup;
