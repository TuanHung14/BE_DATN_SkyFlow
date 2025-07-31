const cron = require("node-cron");
const { updateMovieStatusLogic } = require("../services/movieService");
const Showtime = require("../model/showtimeModel");
const Ticket = require("../model/ticketModel");
const User = require("../model/userModel");
const Level = require("../model/levelModel");
const { queryMomoPayment, queryZaloPayPayment, queryVnPayPayment } = require("../controller/paymentController");

module.exports = () => {
    // Cron job chạy hàng ngày lúc 00:00
    cron.schedule("0 0 * * *", async () => {
        try {
            const count = await updateMovieStatusLogic();

            // Xóa các showtime có showDate trước 2 ngày
            const daysToKeep = 2;
            const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

            const result = await Showtime.updateMany(
                {
                    showDate: {$lt: cutoffDate},
                    isDeleted: { $ne: true }
                },
                {
                    $set: {
                        isDeleted: true
                    }
                }
            );

        } catch (error) {
            console.error("Cronjob error:", error);
        }
    });

    // Cron job kiểm tra payment status mỗi 5 phút
    cron.schedule("*/5 * * * *", async () => {
       try{
           const now = Date.now();
           const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
           const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000);
           const pendingTickets = await Ticket.find({
               paymentStatus: "Pending",
               createdAt: {
                   $gte: oneDayAgo,
                   $lte: fifteenMinutesAgo
               },
           }).populate("paymentMethodId");


           if (pendingTickets.length > 0) {
               for (const ticket of pendingTickets) {
                   if(ticket.paymentMethodId.type === "Momo" && ticket._id) {
                       await queryMomoPayment(ticket._id);
                   }else if(ticket.paymentMethodId.type === "Zalopay" && ticket.appTransId) {
                       await queryZaloPayPayment(ticket.appTransId, ticket._id);
                   }else if(ticket.paymentMethodId.type === "VnPay" && ticket.transDate) {
                       const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                       await queryVnPayPayment(ticket._id, ticket.transDate)
                       await delay(1500);
                   }
               }
           }
           console.log("Update status payment success");
       }catch (error) {
           console.error("Update status error", error);
       }
    });

    // Cron job: Cập nhật trạng thái showtime khi sắp đến giờ chiếu (5 phút trước)
    cron.schedule("* * * * *", async () => {
        try{
            const now = new Date();
            const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

            const upcomingShowtimes = await Showtime.find({
                startTime: { $gte: now, $lte: fiveMinutesFromNow },
                isDeleted: { $ne: true },
                status: "scheduled"
            });

            if (upcomingShowtimes.length > 0) {
                await Showtime.updateMany(
                    {
                        _id: { $in: upcomingShowtimes.map(show => show._id) }
                    },
                    {
                        $set: { status: "ongoing" }
                    }
                );

                console.log(`✅ Updated ${upcomingShowtimes.length} showtimes to 'ongoing' status`);
            }
        }catch (error) {
            console.error("Showtime status update cronjob ongoing error: ", error);
        }
    })

    // Cron job để đánh dấu showtime đã kết thúc sau 10p
    cron.schedule("*/10 * * * *", async () => {
        try{
            const now = new Date();

            await Showtime.updateMany(
                {
                    endTime: { $lt: now },
                    isDeleted: false,
                    status: { $ne: "finished" }
                },
                {
                    $set: { status: "finished" }
                }
            );
            console.log(`Updated ${now} showtimes to 'ongoing' status`);
        }catch (error) {
            console.error("❌ Showtime status update cronjob finished error:", error);
        }
    });

    // Cron job chạy 1 năm 1 lần
    cron.schedule("0 0 1 1 *", async () => {
        try {
            const defaultLevel = await Level.findOne({ isDefault: true, active: true });

            await User.updateMany(
                { points: { $gt: 0 } },
                { $set: { memberShipPoints: 0, totalEarnedPoints: 0, spinCount: 0, level: defaultLevel._id } }
            );

            console.log(`✅ Reset points for users`);
        } catch (error) {
            console.error("❌ Error resetting points:", error);
        }
    });
};
