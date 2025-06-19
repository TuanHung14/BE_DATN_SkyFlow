const cron = require("node-cron");
const { updateMovieStatusLogic } = require("../services/movieService");
const Showtime = require("../model/showtimeModel");

module.exports = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const count = await updateMovieStatusLogic();

      // Xóa các showtime có showDate trước 2 ngày
      const daysToKeep = 2;
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await Showtime.deleteMany({
        showDate: { $lt: cutoffDate }
      });

    } catch (error) {
      console.error("Cronjob error:", error);
    }
  });
};
