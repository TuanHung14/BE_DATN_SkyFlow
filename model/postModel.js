const mongoose = require("mongoose");
const slugify = require("slugify");
const { create } = require("./likePostModel");

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["preview", "review"],
    default: "preview",
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  views: { type: Number, default: 0 },
  content: {
    type: String,
    required: [true, "Nội dung là bắt buộc"],
  },
  imgUrl: {
    type: String,
    required: [true, "Ảnh đại diện bài viết là bắt buộc"],
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  slug: { type: String, unique: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Tự động tạo slug từ title trước khi lưu
postSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
