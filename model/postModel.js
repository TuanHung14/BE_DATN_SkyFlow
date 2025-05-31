const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  views: { type: Number, default: 0 },
  slug: { type: String, unique: true }, // Thêm slug
});

// Tự động tạo slug từ title trước khi lưu
postSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
