const cron = require("node-cron");
const { updateMovieStatusLogic } = require("../services/movieService");
const Showtime = require("../model/showtimeModel");
const Ticket = require("../model/ticketModel");
const { queryMomoPayment, queryZaloPayPayment } = require("../controller/paymentController");

module.exports = () => {
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

    cron.schedule("*/5 * * * *", async () => {
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
                   await queryZaloPayPayment(ticket.appTransId);
               }
            }
        }
    })
};
