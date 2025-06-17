const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const chatAI = require("../utils/chatAI");

exports.chatAI = catchAsync(async (req, res, next) => {
    const { prompt } = req.body;

    if (!prompt) {
        return next(new AppError('Prompt is required', 400));
    }

    const result = await chatAI(prompt);

    res.status(200).json({
        status: 'success',
        data: {
            content: result
        }
    });
});