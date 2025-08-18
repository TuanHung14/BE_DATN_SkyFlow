const Movie = require("../model/movieModel");
const Ticket = require("../model/ticketModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const { filterObj } = require("../utils/helper");
const { updateMovieStatusLogic } = require("../services/movieService");
const searchDB = require("../utils/searchDB");
const APIAggregate = require("../utils/apiAggregate");
// const Showtime = require("../model/showtimeModel");
const mongoose = require("mongoose");

// CREATE MOVIE
exports.createMovie = catchAsync(async (req, res, next) => {
  // Chỉ cho phép các trường được tạo
  const allowedFields = [
    "name",
    "nation",
    "releaseDate",
    "duration",
    "description",
    "age",
    "posterUrl",
    "imageLandscape",
    "trailerUrl",
    "directorId",
    "genresId",
    "castId",
    "format"
  ];
  const data = filterObj(req.body, ...allowedFields);

  // Tạo phim
  const newMovie = await Movie.create(data);

  res.status(201).json({
    status: "success",
    data: {
      data: newMovie,
    },
  });
});
// UPDATE MOVIE
exports.updateMovie = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Chỉ cho phép các field này được cập nhật
  const allowedFields = [
    "name",
    "nation",
    "releaseDate",
    "duration",
    "description",
    "age",
    "posterUrl",
    "imageLandscape",
    "trailerUrl",
    "directorId",
    "genresId",
    "castId",
    "format",
    "publishStatus",
  ];
  const data = filterObj(req.body, ...allowedFields);

  const movie = await Movie.findById(id);
  if (!movie) {
    return next(new AppError("Không tìm thấy phim", 404));
  }

  // Kiểm tra trùng tên nếu có cập nhật name
  if (data.name && data.name !== movie.name) {
    const duplicate = await Movie.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (duplicate) {
      return next(
        new AppError("Tên phim đã tồn tại. Vui lòng chọn tên khác", 400)
      );
    }
  }

  // Cập nhật và lưu
  Object.assign(movie, data);
  await movie.save();

  res.status(200).json({
    status: "success",
    data: { data: movie },
  });
});

exports.getMovieBySlug = catchAsync(async (req, res, next) => {
  const movie = await Movie.findOne({
    slug: req.params.slug,
    isDeleted: false,
    publishStatus: { $ne: "DRAFT" },
  }).populate("castId genresId directorId");

  if (!movie) {
    return next({
      statusCode: 404,
      message: "Không tìm thấy phim với slug này",
    });
  }

  res.status(200).json({
    status: "success",
    data: movie,
  });
});

exports.getMovieRecommend = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(200).json({
      status: "success",
      data: [],
    });
  }

  const watchedMovieIdsRaw = await Ticket.aggregate([
    {
      $match: {
        userId: userId,
        paymentStatus: "Paid",
      },
    },
    {
      $lookup: {
        from: "showtimes",
        localField: "showtimeId",
        foreignField: "_id",
        as: "showtime",
      },
    },
    { $unwind: "$showtime" },
    {
      $group: {
        _id: null,
        movieIds: { $addToSet: "$showtime.movieId" },
      },
    },
  ]);

  const watchedMovieIds = watchedMovieIdsRaw[0]?.movieIds || [];

  const movies = await Ticket.aggregate([
    {
      $match: {
        userId: userId,
        paymentStatus: "Paid",
      },
    },
    // Bước 2: Lookup để lấy movie_id qua showtime
    {
      $lookup: {
        from: "showtimes",
        localField: "showtimeId",
        foreignField: "_id",
        as: "showtime",
      },
    },
    { $unwind: "$showtime" },

    // Bước 3: Lookup để lấy genres_id từ movies
    {
      $lookup: {
        from: "movies",
        localField: "showtime.movieId",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: "$movie" },

    // Bước 4: Lấy các genres_id
    {
      $project: {
        genresId: "$movie.genresId",
      },
    },
    { $unwind: "$genresId" },

    // Bước 5: Đếm số lần xem mỗi thể loại (nếu cần)
    {
      $group: {
        _id: "$genresId",
        count: { $sum: 1 },
      },
    },

    // Bước 6: Sắp xếp thể loại nhiều lượt xem nhất
    { $sort: { count: -1 } },

    // Bước 7: Lấy 1-3 thể loại xem nhiều nhất
    { $limit: 3 },
  ]);

  if (movies.length === 0) {
    return res.status(200).json({
      status: "success",
      data: [],
    });
  }

  const genresIds = movies.map((item) => item._id);

  const recommendedMovies = await Movie.find({
    genresId: { $in: genresIds },
    _id: { $nin: watchedMovieIds },
    isDeleted: false,
    publishStatus: "PUBLISHED",
    status: "NOW_SHOWING"
  })
    .populate("castId genresId directorId")
    .limit(4);

  if (recommendedMovies.length === 0) {
    return next(new AppError("Không tìm thấy phim nào phù hợp", 404));
  }

  res.status(200).json({
    status: "success",
    data: recommendedMovies,
  });
});

exports.getAllMovies = catchAsync(async (req, res, next) => {
  const user = req.user;
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const { genresId, search, castId, directorId, status, sort } = req.query;
  const filter = {
    publishStatus: "PUBLISHED",
    isDeleted: false,
  };

  // Viết hàm chuyển đổi string id trong [] thành mảng ObjectId
  if (genresId) {
    const genresIdArray = genresId.map((id) => new mongoose.Types.ObjectId(id));
    filter.genresId = { $in: genresIdArray };
  }
  if (castId) {
    const castIdArray = castId.map((id) => new mongoose.Types.ObjectId(id));
    filter.castId = { $in: castIdArray };
  }
  if (directorId) {
    filter.directorId = new mongoose.Types.ObjectId(directorId);
  }
  if (status) {
    filter.status = status;
  }

  const pipeline = [{ $match: filter }];

  if (search) {
    pipeline.push({
      $match: {
        name: searchDB(search.name),
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: "wishlistmovies",
      localField: "_id",
      foreignField: "movieId",
      as: "wishlists",
    },
  });

  pipeline.push({
    $addFields: {
      isWishlisted: user
        ? {
            $in: [
              { $toObjectId: user._id },
              {
                $map: {
                  input: "$wishlists",
                  as: "wish",
                  in: "$$wish.userId",
                },
              },
            ],
          }
        : false,
    },
  });

  pipeline.push(
    {
      $lookup: {
        from: "movieentities",
        localField: "castId",
        foreignField: "_id",
        as: "castId",
      },
    },
    {
      $lookup: {
        from: "movieentities",
        localField: "genresId",
        foreignField: "_id",
        as: "genresId",
      },
    },
    {
      $lookup: {
        from: "movieentities",
        localField: "directorId",
        foreignField: "_id",
        as: "directorId",
      },
    },
    { $unwind: { path: "$directorId", preserveNullAndEmptyArrays: true } } // Nếu cần
  );

  if (sort) {
    const sortFields = sort.split(","); // ['name', '-releaseDate']
    const sortObj = {};

    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });

    pipeline.push({ $sort: sortObj });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // pipeline.push({ $unset: ["wishlists"] });

  const data = await APIAggregate(Movie, { limit, page }, pipeline);

  res.status(200).json(data);
});

exports.getAllMoviesAdmin = Factory.getAll(Movie, "castId genresId directorId format");

exports.getMovie = Factory.getOne(Movie, "castId genresId directorId format");

// SOFT DELETE
exports.softDeleteMovie = Factory.softDeleteOne(Movie);

exports.updateMovieStatusHandler = catchAsync(async (req, res, next) => {
  const count = await updateMovieStatusLogic();

  res.status(200).json({
    status: "success",
    message: `Cập nhật ${count} phim`,
  });
});
