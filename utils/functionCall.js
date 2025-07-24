const { getUserInfo } = require("../services/userService");
const { getMovies } =require("../services/movieService");


async function executeFunction(functionName, userId) {
    switch (functionName) {
        case 'getUserInfo':
            if(!userId) {
                return "Tài khoản chưa đăng nhập!";
            }
            return await getUserInfo(userId);
        case 'getMovies':
            return await getMovies();
        default:
            return { error: `Chat AI đang lỗi vui lòng thử lại sau!` };
    }
}

module.exports = executeFunction;