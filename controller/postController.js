const Post = require("../model/postModel");
const LikePost = require("../model/likePostModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Factory = require("./handleFactory");
const APIAggregate = require("../utils/apiAggregate");
const searchDB = require("../utils/searchDB");
exports.getAllPostsAdmin = catchAsync(async (req, res, next) => {
  const user = req.user;

  // Ép kiểu an toàn cho limit và page
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const { type, sort, search } = req.query;

  const filter = {};
  const pipeline = [];

  // Lọc theo type nếu có
  if (type) {
    filter.type = type;
  }

  pipeline.push({ $match: filter });

  // Tìm kiếm theo tiêu đề nếu có
  if (search) {
    pipeline.push({
      $match: {
        $or: [{ title: searchDB(search) }],
      },
    });
  }

  // Join với bảng LikePost
  pipeline.push({
    $lookup: {
      from: "likeposts",
      localField: "_id",
      foreignField: "postId",
      as: "likes",
    },
  });

  // Thêm trường isLiked
  pipeline.push({
    $addFields: {
      isLiked: user
        ? {
            $in: [
              { $toObjectId: user._id },
              {
                $map: {
                  input: "$likes",
                  as: "like",
                  in: "$$like.userId",
                },
              },
            ],
          }
        : false,
    },
  });

  // Sort
  if (sort) {
    const sortOption = {};
    const [key, order] = sort.split(",");
    sortOption[key] = order === "desc" ? -1 : 1;
    pipeline.push({ $sort: sortOption });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // Bỏ trường likes nếu không cần
  pipeline.push({ $unset: ["likes"] });

  // Gọi aggregate với limit/page đã ép kiểu
  const data = await APIAggregate(Post, { limit, page }, pipeline);

  res.status(200).json(data);
});
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const user = req.user;

  // Ép kiểu an toàn cho limit và page
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const { type, sort, search } = req.query;

  const filter = {};
  const pipeline = [];

  // Lọc theo type nếu có
  if (type) {
    filter.type = type;
  }
  filter.isPublished = true;
  pipeline.push({ $match: filter });

  // Tìm kiếm theo tiêu đề nếu có
  if (search) {
    pipeline.push({
      $match: {
        $or: [{ title: searchDB(search) }],
      },
    });
  }

  // Join với bảng LikePost
  pipeline.push({
    $lookup: {
      from: "likeposts",
      localField: "_id",
      foreignField: "postId",
      as: "likes",
    },
  });

  // Thêm trường isLiked
  pipeline.push({
    $addFields: {
      isLiked: user
        ? {
            $in: [
              { $toObjectId: user._id },
              {
                $map: {
                  input: "$likes",
                  as: "like",
                  in: "$$like.userId",
                },
              },
            ],
          }
        : false,
    },
  });

  // Sort
  if (sort) {
    const sortOption = {};
    const [key, order] = sort.split(",");
    sortOption[key] = order === "desc" ? -1 : 1;
    pipeline.push({ $sort: sortOption });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // Bỏ trường likes nếu không cần
  pipeline.push({ $unset: ["likes"] });

  // Gọi aggregate với limit/page đã ép kiểu
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

  // 1. Kiểm tra bài viết tồn tại
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("Không tìm thấy bài viết", 404));
  }

  // 2. Kiểm tra đã like chưa
  const existingLike = await LikePost.findOne({ postId, userId });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json({
      status: "success",
      liked: false,
      message: "Đã bỏ like bài viết",
    });
  }

  // 3. Tạo like mới
  await LikePost.create({ postId, userId }); // Trigger post middleware

  return res.status(201).json({
    status: "success",
    liked: true,
    message: "Đã like bài viết",
  });
});
exports.getFavoritePosts = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const favorites = await LikePost.find({ userId }).populate({
    path: "postId",
    match: { isPublished: true }, // chỉ lấy post đã được publish
  });

  const posts = favorites.map((item) => item.postId);

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
    { slug, isPublished: true },
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
