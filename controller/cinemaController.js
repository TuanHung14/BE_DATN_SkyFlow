const Cinema = require("../model/cinemaModel");
const Factory = require("./handleFactory");
const catchAsync = require("../utils/catchAsync");
const Room = require("../model/roomModel");
const Showtime = require("../model/showtimeModel");
const { ObjectId } = require("mongoose").Types;

exports.createCinema = Factory.createOne(Cinema);

exports.getAllCinemas = Factory.getAll(Cinema);

exports.getOneCinema = Factory.getOne(Cinema);

exports.updateCinema = Factory.updateOne(Cinema);

exports.deleteCinema = Factory.softDeleteOne(Cinema);

exports.getFilteredCinemas = catchAsync(async (req, res, next) => {
  const { province, date, movieId } = req.query;

  const cinemaMatch = { isDeleted: false };
  if (province) {
    cinemaMatch.province = province;
  }

  const showtimeConditions = [{ $eq: ["$isDeleted", false] }];
  if (movieId) {
    showtimeConditions.push({ $eq: ["$movieId", new ObjectId(movieId)] });
  }
  if (date) {
    showtimeConditions.push({ $eq: ["$showDate", new Date(date)] });
  }

  const pipeline = [
    // 1. Lọc rạp chiếu phim
    { $match: cinemaMatch },

    // 2. Lấy danh sách phòng thuộc rạp
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "cinemaId",
        as: "rooms",
      },
    },

    // 3. Lấy ID của các phòng không bị xóa
    {
      $addFields: {
        roomIds: {
          $map: {
            input: {
              $filter: {
                input: "$rooms",
                as: "room",
                cond: { $eq: ["$$room.isDeleted", false] },
              },
            },
            as: "room",
            in: "$$room._id",
          },
        },
      },
    },

    // 4. Lấy suất chiếu tương ứng với các phòng
    {
      $lookup: {
        from: "showtimes",
        let: { roomIds: "$roomIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$roomId", "$$roomIds"] },
                  ...showtimeConditions,
                ],
              },
            },
          },
        ],
        as: "showtimes",
      },
    },

    // 5. Chỉ giữ lại các rạp có ít nhất một suất chiếu
    {
      $match: {
        "showtimes.0": { $exists: true },
      },
    },

    // 6. Định dạng kết quả: thông tin rạp và mảng thời gian
    {
      $project: {
        cinema: {
          _id: "$_id",
          name: "$name",
          province: "$province",
        },
        times: "$showtimes.startTime",
      },
    },
  ];

  const data = await Cinema.aggregate(pipeline);

  res.status(200).json({
    status: "success",
    results: data.length,
    data: data,
  });
});

exports.getNearestCinemas = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { unit } = req.params;
  // unit có thể là 'mi' (dặm) hoặc 'km' (kilomet)
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  let cinemas;

  if (
    !user ||
    user.location.coordinates[0] === 0 ||
    user.location.coordinates[1] === 0
  ) {
    cinemas = await Cinema.find(
      {
        isDeleted: false,
      },
      {
        name: 1,
        province: 1,
        district: 1,
        ward: 1,
        address: 1,
        phone: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(4);

    return res.status(200).json({
      status: "success",
      data: {
        cinemas,
      },
    });
  }

  const [latitude, longitude] = user.location.coordinates;

  cinemas = await Cinema.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [latitude * 1, longitude * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
        query: { isDeleted: false },
      },
    },
    {
      $limit: 4,
    },
    {
      $project: {
        name: 1,
        province: 1,
        district: 1,
        ward: 1,
        address: 1,
        phone: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      cinemas,
    },
  });
});
exports.getShowtimesByCinemaByDate = catchAsync(async (req, res, next) => {
  const { cinemaId, date } = req.query;

  if (!cinemaId || !date) {
    return next(new AppError("Vui lòng cung cấp đầy đủ cinemaId và date", 400));
  }

  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    return next(
      new AppError("Ngày không hợp lệ. Định dạng đúng: YYYY-MM-DD", 400)
    );
  }

  // Thiết lập khoảng thời gian trong ngày đó
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  // Lấy các phòng chiếu thuộc rạp
  const rooms = await Room.find({ cinemaId, isDeleted: false }).select("_id");
  const roomIds = rooms.map((room) => room._id);

  // Lấy các suất chiếu trong ngày được chọn
  const showtimes = await Showtime.find({
    roomId: { $in: roomIds },
    isDeleted: false,
    showDate: {
      $gte: start,
      $lte: end,
    },
  }).populate("movieId");

  // Gom các phim chiếu trong ngày
  const movieMap = new Map();

  showtimes.forEach((showtime) => {
    const movie = showtime.movieId;
    if (movie && !movieMap.has(movie._id.toString())) {
      movieMap.set(movie._id.toString(), movie);
    }
  });

  res.status(200).json({
    status: "success",
    data: {
      date: date,
      movies: Array.from(movieMap.values()),
    },
  });
});
