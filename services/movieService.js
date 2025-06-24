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

async function getMovies(){
    return await Movie.find({
        isDeleted: false,
        status: "NOW_SHOWING"
    }).limit(3).sort({createdAt: -1});
}

module.exports = { updateMovieStatusLogic, getMovies };
