const mongoose = require("mongoose");

const movieEntitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["genre", "cast", "director"],
      required: [true, "Không được để trống"],
    },
    name: {
      type: String,
      required: [true, "Không được để trống"],
    },
      isDeleted: {
        type: Boolean,
        default: false,
      }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovieEntity", movieEntitySchema);
