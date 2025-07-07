// movieService.js
const Showtime = require("../model/showtimeModel");

async function getCountShowtimeNow() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay UTC
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Bắt đầu ngày mai UTC

    return await Showtime.countDocuments({
        showDate: {
            $gte: today,
            $lt: tomorrow
        },
        isDeleted: false,
    });
}


module.exports = { getCountShowtimeNow };
