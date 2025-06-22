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
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    district: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    ward: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
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
