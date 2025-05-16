const mongoose = require("mongoose");

const movieEntitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Đạo diễn", "Thể loại", "Diễn viên"],
      required: [true, "Không được để trống"],
    },
    name: {
      type: String,
      required: [true, "Không được để trống"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovieEntity", movieEntitySchema);
