const cron = require("node-cron");
const { updateMovieStatusLogic } = require("../services/movieService");

module.exports = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const count = await updateMovieStatusLogic();
    } catch (error) {
      console.error("Cronjob error:", error);
    }
  });
};
