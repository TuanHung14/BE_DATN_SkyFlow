const mongoose = require("mongoose");

const wishlistMovieSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Unique index: mỗi user chỉ like 1 post 1 lần
wishlistMovieSchema.index({ movieId: 1, userId: 1 }, { unique: true });


module.exports = mongoose.model("WishlistMovie", wishlistMovieSchema);
