const catchAsync = require('../utils/catchAsync');
const movieService = require('../services/movieService');
const showtimeService = require('../services/showtimeService');
const ticketService = require('../services/ticketService');
const AppError = require("../utils/appError");

// Lấy thống kê tổng quan
exports.getSummary = catchAsync(async (req, res, next) => {
    // Phim đang chiếu của rạp
    const countMoviesNow = await movieService.getCountMoviesNow();

    // Lịch chiếu phim trong ngày
    const countShowtimeNow = await showtimeService.getCountShowtimeNow();

    // Tổng số vé đã bán trong ngày
    const countTicketsNow = await ticketService.getCountTicketsNow();

    // Tổng doanh thu trong ngày
    const totalRevenueNow = await ticketService.getTotalRevenueNow();

    res.status(200).json({
        status: 'success',
        data: {
            countMoviesNow,
            countShowtimeNow,
            countTicketsNow,
            totalRevenueNow
        }
    })
})

// Lấy doanh thu theo tháng hoặc theo tuần
exports.getRevenueByTime = catchAsync(async (req, res, next) => {
    const { type } = req.query; // 'month' hoặc 'week'

    if (!type || (type !== 'month' && type !== 'week')) {
       next(new AppError('Phải truyền type là "month" hoặc "week"', 400));
    }

    const revenueData = await ticketService.getRevenueByTime(type);

    res.status(200).json({
        status: 'success',
        data: revenueData
    });
});

// Lấy những bộ phim được mua vé nhiều nhất
exports.getTopMovies = catchAsync(async (req, res, next) => {
    const topMovies = await ticketService.getTopMovies();

    if (!topMovies) {
        return next(new AppError('Không có dữ liệu phim nào được mua vé', 404));
    }

    res.status(200).json({
        status: 'success',
        data: topMovies
    });
});