const mongoose = require("mongoose");

const movieEntitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["director", "genre", "cast"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovieEntity", movieEntitySchema);
