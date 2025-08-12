const Ticket = require('../model/ticketModel');

// Tổng số vé đã bán trong ngày
async function getCountTicketsNow() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay UTC
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Bắt đầu ngày mai UTC

    return await Ticket.countDocuments({
        createdAt: {
            $gte: today,
            $lt: tomorrow
        },
        paymentStatus: 'Paid'
    });
};

//Tổng doanh thu trong ngày
async function getTotalRevenueNow() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay UTC
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Bắt đầu ngày mai UTC

    const tickets = await Ticket.find({
        createdAt: {
            $gte: today,
            $lt: tomorrow
        },
        paymentStatus: 'Paid'
    });

    return tickets.reduce((total, ticket) => total + ticket.totalAmount, 0);
}

// Lấy doanh thu theo tháng hoặc theo tuần
async function getRevenueByTime(type) {
    const now = new Date();

    let matchStage = {
        paymentStatus: 'Paid',
        createdAt: {}
    };

    let groupStage, projectStage, sortStage, startDate, endDate;

    if (type === 'month') {
        // lấy tháng cách đây 11 tháng 1 là ngày đầu tiên của tháng đó
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        // Ngày cuối cùng của tháng hiện tại. VD: new Date(2025, 8, 0) → ra ngày 31/07/2025 (ngày cuối tháng 7).
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        matchStage.createdAt = { $gte: startDate, $lte: endDate };

        groupStage = {
            _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
            },
            totalRevenue: { $sum: "$totalAmount" }
        };

        projectStage = {
            _id: 0,
            date: {
                $concat: [
                    { $cond: [{ $lt: ["$_id.month", 10] }, { $concat: ["0", { $toString: "$_id.month" }] }, { $toString: "$_id.month" }] },
                    "/",
                    { $toString: "$_id.year" }
                ]
            },
            totalRevenue: 1
        };

        sortStage = { date: 1 };
    }

    if (type === 'week') {
        startDate = new Date();
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;

        matchStage.createdAt = { $gte: startDate, $lte: now };

        groupStage = {
            _id: {
                day: { $dayOfMonth: "$createdAt" },
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
            },
            totalRevenue: { $sum: "$totalAmount" }
        };

        projectStage = {
            _id: 0,
            date: {
                $concat: [
                    { $toString: "$_id.day" },
                    "/",
                    { $toString: "$_id.month" },
                    "/",
                    { $toString: "$_id.year" }
                ]
            },
            totalRevenue: 1
        };

        sortStage = { "date": 1 };
    }

    const revenueData = await Ticket.aggregate([
        { $match: matchStage },
        { $group: groupStage },
        { $project: projectStage },
        { $sort: sortStage }
    ]);

    const allDates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        allDates.push(
            type === 'month'
                ? `${String(current.getMonth() + 1).padStart(2, '0')}/${current.getFullYear()}`
                : `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`
        );
        type === 'month'
            ? current.setMonth(current.getMonth() + 1)
            : current.setDate(current.getDate() + 1);
    }

    const filledData = allDates.map(dateStr => {
        const found = revenueData.find(r => r.date === dateStr);
        return type === 'month' ? { month: dateStr, totalRevenue: found ? found.totalRevenue : 0 } : { date: dateStr, totalRevenue: found ? found.totalRevenue : 0 };
    });

    return filledData;
}

// Lấy những bộ phim được mua vé nhiều nhất
async function getTopMovies() {
    const topMovies = await Ticket.aggregate([
        {
            $match: {
                paymentStatus: "Paid"
            }
        },
        {
            $lookup: {
                from: "ticketseats",
                localField: "_id",
                foreignField: "ticketId",
                as: "ticketseats",
            }
        },
        { $unwind: "$ticketseats" },
        {
            $lookup: {
                from: "showtimes",
                localField: "showtimeId",
                foreignField: "_id",
                as: "showtime"
            }
        },
        { $unwind: "$showtime" },
        {
            $group: {
                _id: "$showtime.movieId", // gom theo phim
                totalSeats: { $sum: 1 }    // mỗi document tương ứng 1 ghế
            }
        },
        {
            $lookup: {
                from: "movies",
                localField: "_id",
                foreignField: "_id",
                as: "movie"
            }
        },
        { $unwind: "$movie" },
        {
            $match: {
                "movie.publishStatus": { $ne: "DRAFT" },
                "movie.status": "NOW_SHOWING"
            }
        },
        {
            $project: {
                _id: 0,
                movieTitle: "$movie.name",
                totalTickets: "$totalSeats"
            }
        },
        {
            $sort: { totalTickets: -1 }
        }
    ]);
    return topMovies
}

module.exports = { getCountTicketsNow, getTotalRevenueNow, getRevenueByTime, getTopMovies };