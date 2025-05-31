const mongoose = require("mongoose");

const likePostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index để tránh trùng like từ cùng 1 user
likePostSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("LikePost", likePostSchema);
