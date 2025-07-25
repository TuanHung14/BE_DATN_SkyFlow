const MovieRating = require('../model/movieRatingModel');
const catchAsync = require('../utils/catchAsync');
const chatAI = require('../utils/chatAI');
const AppError = require('../utils/appError');


exports.createMovieRating = catchAsync(async (req, res, next) => {
    const { rating, ticketId, review } = req.body;

    // Kiểm tra review có từ ngữ không phù hợp hay không
    if (review && review.length > 0) {
        const systemInstruction = `
        Bạn là hệ thống kiểm duyệt đánh giá người dùng. Hãy kiểm tra xem review có chứa từ ngữ tục tĩu, xúc phạm, chửi thề — bao gồm cả viết không dấu (ví dụ: 'du ma', 'dit me', 'dm', 'vcl', 'cac', 'lon', 'vu' ,v.v.) hoặc viết lái, viết tắt mang nghĩa tiêu cực.
        
        Chỉ trả về đúng 'true' nếu có từ ngữ không phù hợp, còn lại trả về 'false'. Không cần giải thích gì thêm.
        `;
        const isInappropriate = await chatAI(review, systemInstruction);
        if (isInappropriate === 'true') {
            return next(new AppError('Đánh giá chứa từ ngữ không phù hợp'));
        }
    }

    const newRating = await MovieRating.create({
        movieId: req.params.movieId,
        userId: req.user._id,
        ticketId,
        rating,
        review,
    });

    res.status(201).json({
        status: 'success',
        data: newRating,
    });
});

exports.getAllMovieRatings = catchAsync(async (req, res, next) => {
    const movieRatings = await MovieRating.find(
        {
            movieId: req.params.movieId,
            review: { $ne: null }
        }
    ).populate('userId', 'name avatar')

    res.status(200).json({
        status: 'success',
        data: movieRatings,
    });
});

