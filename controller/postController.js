const Post = require("../model/postModel");
const LikePost = require("../model/likePostModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Factory = require("./handleFactory");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const user = req.user;
  console.log("User:", user);

  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .pagination();

  let posts = await features.query;
  posts = posts.map((post) => post.toObject());

  if (user) {
    const likedPostIds = await LikePost.find({ userId: user._id }).distinct(
      "postId"
    );

    posts = posts.map((post) => ({
      ...post,
      isLiked: likedPostIds.includes(post._id.toString()),
    }));
  }

  const totalDocs = await Post.countDocuments();

  res.status(200).json({
    status: "success",
    totalDocs,
    data: {
      data: posts,
    },
  });
});

exports.getPostById = Factory.getOne(Post);
exports.createPost = Factory.createOne(Post);
exports.updatePost = Factory.updateOne(Post);
exports.deletePost = Factory.deleteOne(Post);
exports.likePost = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  // Kiểm tra bài viết có tồn tại
  const post = await Post.findById(postId);
  if (!post) return next(new AppError("Không tìm thấy bài viết", 404));

  // Kiểm tra đã like chưa
  const existingLike = await LikePost.findOne({ postId, userId });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json({
      status: "success",
      message: "Đã bỏ like bài viết",
    });
  }

  await LikePost.create({ postId, userId });

  return res.status(200).json({
    status: "success",
    message: "Đã like bài viết",
  });
});
exports.getFavoritePosts = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const favorites = await LikePost.find({ userId }).populate("postId");

  const posts = [];
  favorites.forEach((item) => {
    posts.push(item.postId);
  });

  res.status(200).json({
    status: "success",
    results: posts.length,
    data: posts,
  });
});
exports.getPostBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const user = req.user;
  console.log("User:", user);
  const post = await Post.findOneAndUpdate(
    { slug },
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!post) return next(new AppError("Post not found", 404));

  const plainPost = post.toObject();
  if (user) {
    const exists = await LikePost.exists({
      userId: user._id,
      postId: post._id,
    });
    plainPost.isLiked = !!exists;
  }

  res.status(200).json({
    status: "success",
    data: {
      post: plainPost,
    },
  });
});
exports.checkLikedPost = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  const existingLike = await LikePost.findOne({
    postId,
    userId,
  });

  res.status(200).json({
    status: "success",
    liked: !!existingLike,
  });
});
