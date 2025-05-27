const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  views: { type: String, default: 0 },
  publishStatus: {
    type: String,
    enum: ["DRAFT", "PUBLISHED"],
    default: "PUBLISHED",
  },
});
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
