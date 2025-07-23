const express = require("express");
const wishlistMovieController = require("../controller/wishlistMovieController");
const router = express.Router({ mergeParams: true });

router.post("/", wishlistMovieController.toggeleWishlistMovie);

router.get("/", wishlistMovieController.getWishlistMovies);

module.exports = router;