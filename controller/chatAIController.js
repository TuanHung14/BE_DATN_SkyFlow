const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const chatAI = require("../utils/chatAI");
const executeFunction = require("../utils/functionCall");
const Prompt = require("../model/promptModel");
const Movie = require("../model/movieModel");

const training =  (keyText) => {
    return `
        Bạn là trợ lý AI của website bán vé xem phim Sky Flow. Hãy trả lời một cách lịch sự và chuyên nghiệp.
        ${keyText}
        Đây là tổng hợp những dữ liệu trong web này hãy xem câu hỏi của khách hàng mà hãy trả lời theo 
         QUAN TRỌNG NẾU CÂU HỎI NẰM TRONG NHỮNG DỮ LIỆU NÀY HÃY LÀM THEO NHỮNG ĐIỀU SAU: 
        - BẮT BUỘC trả về CHÍNH XÁC dưới dạng HTML thuần túy
        - KHÔNG sử dụng markdown
        - KHÔNG thêm \`\`\`html hoặc bất kỳ code block nào
        - KHÔNG giải thích code
        - CHỈ trả về HTML content thuần túy
        - Sử dụng thẻ HTML semantic như <h1>, <h2>, <p>, <div>, <span>, <ul>, <li>, <strong>, <em>
        - Đảm bảo HTML valid và well-formed
        
        Ví dụ format trả về:
        <div>
            <h2>Thông tin khách hàng</h2>
            <p><strong>Họ tên:</strong> Nguyễn Văn A</p>
            <p><strong>Email:</strong> example@email.com</p>
        </div>
        CÒN KHÔNG HÃY TRẢ VỀ DẠNG TEXT NHƯ BÌNH THƯỜNG
    `;
}

const callFunctionByPrompt = async (functionToCall, template, userId) => {
    const data = await executeFunction(functionToCall, userId);
    if (data.error) throw new AppError(data.error, 500);

    let context;
    if (Array.isArray(data)) {
        const cleanedArray = data.map(item => item.toObject?.() || item);
        context = { datas: cleanedArray };
    } else {
        context = data.toObject?.() || data;
    }

    return { template, context };
}

exports.chatAIByPrompt = catchAsync(async (req, res, next) => {
    const promptId  = req.params.id;

    if (!promptId) {
        return next(new AppError('Gợi ý không được để trống', 400));
    }

    const prompt = await Prompt.findOne({ _id: promptId, status: 'active' });

    if(!prompt){
        return next(new AppError('Gợi ý không được tìm thấy vui lòng thử lại sau', 400));
    }

    const { template, context } = await callFunctionByPrompt(prompt.functionToCall, prompt.template, req.user?._id);


    const keyText = `
        systemInstruction: ${prompt.systemInstruction}
        template: ${template}
        data: ${JSON.stringify(context)}
    `;

    const systemInstruction = training(keyText);


    const result = await chatAI('Trả lời theo systemInstruction và dữ liệu là template', systemInstruction);

    res.status(200).json({
        status: 'success',
        data: {
            content: result
        }
    });
});

exports.chatAI = catchAsync(async (req, res, next) => {
    const { prompt } =req.body;

    if (!prompt) {
        return next(new AppError('Prompt is required', 400));
    }

    const fullPrompt = await Prompt.find({
        status: 'active'
    });

    const rendered = [];
    for (let prompt of fullPrompt) {
        const obj = {};
        const { template, context } = await callFunctionByPrompt(prompt.functionToCall, prompt.template, req?.user?._id);
        obj.template = template;
        obj.systemInstruction = prompt.systemInstruction;
        obj.context = context;
        rendered.push(obj);
    }

    const keyText = rendered.map((item) => `systemInstruction: ${item.systemInstruction} \n  template: ${item.template} \n data: ${JSON.stringify(item.context)}`).join('\n');
    const systemInstruction = training(keyText);

    const result = await chatAI(prompt, systemInstruction);

    res.status(200).json({
        status: 'success',
        data: {
            content: result
        }
    });
})

exports.generateReview= catchAsync(async (req, res, next) => {
    const { rating, movieId } = req.body;

    if (!rating || !movieId) {
        return next(new AppError('Rating and movieId are required', 400));
    }
    const movie = await Movie.findById(movieId);

    const systemInstruction = `
        Bạn là một AI chuyên viết đánh giá phim. Hãy viết một đánh giá ngắn gọn dưới 100 từ và súc tích cho bộ phim ${movie.name} với rating ${rating} sao.
        Đánh giá nên bao gồm cảm nhận về nội dung, diễn xuất, hình ảnh và âm thanh của bộ phim.
        Tránh sử dụng từ ngữ tục tĩu hoặc xúc phạm.
        Chỉ trả về đánh giá dưới dạng văn bản thuần túy, không cần định dạng HTML hay markdown.
    `;

    const review = await chatAI(`Viết đánh giá cho bộ phim ${movie.name} với rating ${rating} sao`, systemInstruction);

    if (!review) {
        return next(new AppError('Không thể tạo đánh giá', 500));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
})

