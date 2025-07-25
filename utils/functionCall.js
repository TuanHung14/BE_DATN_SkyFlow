const { getUserInfo } = require("../services/userService");
const { getMovies } =require("../services/movieService");
const { getShowtimes } = require("../services/showtimeService");
const { getCinemaList } = require("../services/cineamsService");
const { getTicketPrices } = require("../services/priceRuleService");


async function executeFunction(functionName, userId) {
    switch (functionName) {
        case 'getUserInfo':
            if(!userId) {
                return "Tài khoản chưa đăng nhập! nên hãy xưng hô thân thiện và trả lời theo câu hỏi nếu biết tên thì hãy chào theo tên họ";
            }
            return await getUserInfo(userId);
        case 'getMovies':
            return await getMovies();
        case 'getShowtimes':
            return await getShowtimes();
        case 'getCinemaList':
            return await getCinemaList();
        case 'getTicketPrices':
            return await getTicketPrices();
        default:
            return { error: `Chat AI đang lỗi vui lòng thử lại sau!` };
    }
}

module.exports = executeFunction;