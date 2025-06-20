const cron = require("node-cron");
const {updateMovieStatusLogic} = require("../services/movieService");
const Showtime = require("../model/showtimeModel");

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
};
