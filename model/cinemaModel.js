const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    province: {
      label: { type: String, required: true },
      value: { type: String, required: true },
    },
    district: {
      label: { type: String, required: true },
      value: { type: String, required: true },
    },
    ward: {
      label: { type: String, required: true },
      value: { type: String, required: true },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Cinema = mongoose.model("Cinema", cinemaSchema);

module.exports = Cinema;
