// movieService.js
const Movie = require("../model/movieModel");
async function updateMovieStatusLogic() {
  // Có lỗi sẽ throw ra, ko cần try/catch ở đây
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await Movie.updateMany(
    {
      releaseDate: { $lte: today },
      status: "COMING_SOON",
    },
    {
      $set: { status: "NOW_SHOWING" },
    }
  );

  return result.modifiedCount;
}

module.exports = { updateMovieStatusLogic };
