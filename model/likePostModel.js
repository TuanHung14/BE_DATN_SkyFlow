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

// Unique index: mỗi user chỉ like 1 post 1 lần
likePostSchema.index({ postId: 1, userId: 1 }, { unique: true });

/**
 * Tính tổng số lượt like cho 1 bài viết và cập nhật vào post.likesCount
 */
likePostSchema.statics.calcLikesCount = async function (postId) {
  const stats = await this.aggregate([
    {
      $match: { postId: new mongoose.Types.ObjectId(postId) },
    },
    {
      $group: {
        _id: "$postId",
        nLikes: { $sum: 1 },
      },
    },
  ]);

  const Post = require("./postModel"); // tránh vòng lặp require

  if (stats.length > 0) {
    await Post.findByIdAndUpdate(postId, {
      likesCount: stats[0].nLikes,
    });
  } else {
    await Post.findByIdAndUpdate(postId, {
      likesCount: 0,
    });
  }
};

// Khi người dùng like bài viết
likePostSchema.post("save", async function () {
  await this.constructor.calcLikesCount(this.postId);
});

// Khi người dùng unlike bài viết bằng deleteOne() trên document
likePostSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calcLikesCount(this.postId);
  }
);

module.exports = mongoose.model("LikePost", likePostSchema);
