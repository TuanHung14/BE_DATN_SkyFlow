// movieService.js
const Movie = require("../model/movieModel");

async function updateMovieStatusLogic(today) {
    const vietnamTime = new Date(today.getTime() + 7 * 60 * 60 * 1000);
    vietnamTime.setUTCHours(0, 0, 0, 0);

    const result = await Movie.updateMany(
    {
      releaseDate: { $lte: vietnamTime },
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
        publishStatus: { $ne: 'DRAFT' }
    }).populate("directorId genresId castId").sort('-createdAt');
}

async function getCountMoviesNow() {
    return await Movie.countDocuments({
        status: 'NOW_SHOWING',
        isDeleted: false,
        publishStatus: { $ne: 'DRAFT' }
    });
}

module.exports = { updateMovieStatusLogic, getMovies, getCountMoviesNow };
