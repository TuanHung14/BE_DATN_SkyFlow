const Post = require("../model/postModel");
const LikePost = require("../model/likePostModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Factory = require("./handleFactory");

exports.getAllPosts = Factory.getAll(Post);
exports.getPostById = Factory.getOne(Post);
exports.createPost = Factory.createOne(Post);
exports.updatePost = Factory.updateOne(Post);
exports.deletePost = Factory.softDeleteOne(Post);
exports.likePost = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  // Chưa cho đăng nhập nên tạm thời dùng userId cứng
  // Trong thực tế sẽ lấy từ req.user.id
  const userId = "664bcf0b1e379bcde4cf5a7b";

  const post = await Post.findById(postId);
  if (!post) return next(new AppError("Post not found", 404));

  const existingLike = await LikePost.findOne({ postId, userId });

  if (existingLike) {
    await LikePost.findByIdAndDelete(existingLike._id);
    return res.status(200).json({
      status: "success",
      message: "Post unliked",
    });
  }

  const newLike = await LikePost.create({ postId, userId }); // Nếu trùng sẽ throw ra ngoài
  const likeCount = await LikePost.countDocuments({ postId });

  res.status(201).json({
    status: "success",
    message: "Post liked",
    data: newLike,
    likeCount,
  });
});
exports.getFavoritePosts = catchAsync(async (req, res, next) => {
  const userId = "664bcf0b1e379bcde4cf5a7b";

  const favorites = await LikePost.find({ userId }).populate("postId");

  res.status(200).json({
    status: "success",
    results: favorites.length,
    data: favorites.map((item) => item.postId),
  });
});
