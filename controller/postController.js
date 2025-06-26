const Post = require("../model/postModel");
const LikePost = require("../model/likePostModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Factory = require("./handleFactory");
const APIAggregate = require("../utils/apiAggregate");
const searchDB = require("../utils/searchDB");

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const user = req.user;

  const { limit = 10, page = 1, type, sort, search } = req.query;

  const filter = {};
  const pipeline = [];

  // Filter theo type nếu có
  if (type) {
    filter.type = type;
  }


  pipeline.push({
    $match: filter,
  });

  if(search){
    pipeline.push({
      $match: {
        $or: [
          { title: searchDB(search)},
        ],
      }
    });
  }

  // Join với bảng LikePost
  pipeline.push({
    $lookup: {
      from: "likeposts", // collection name trong MongoDB
      localField: "_id",
      foreignField: "postId",
      as: "likes",
    },
  });

  // Gắn isLiked nếu có user
  if (user) {
    pipeline.push({
      $addFields: {
        isLiked: {
          $in: [user._id, "$likes.userId"],
        },
      },
    });
  }

  // Sort nếu có
  if (sort) {
    const sortOption = {};
    const [key, order] = sort.split(",");
    sortOption[key] = order === "desc" ? -1 : 1;
    pipeline.push({
      $sort: sortOption,
    });
  } else {
    pipeline.push({
      $sort: { createdAt: -1 },
    });
  }

  // Lấy các trường cần thiết
  pipeline.push({
    $project: {
      title: 1,
      content: 1,
      createdAt: 1,
      type: 1,
      isLiked: 1,
    },
  });

  const data = await APIAggregate(Post, { limit, page }, pipeline);

  res.status(200).json(data);
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
