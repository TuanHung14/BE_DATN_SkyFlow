const e = require("express");
const mongoose = require("mongoose");
const slugify = require("slugify");

const movieSchema = new mongoose.Schema(
    {
        directorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MovieEntity",
            required: [true, "Phim phải có đạo diễn"],
        },
        genresId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MovieEntity",
                required: [true, "Phim phải có ít nhất một thể loại"],
            },
        ],
        castId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MovieEntity",
                required: [true, "Phim phải có ít nhất một diễn viên"],
            },
        ],
        name: {
            type: String,
            required: [true, "Phim phải có tên"],
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, "Phim phải có thời lượng"],
            min: [1, "Thời lượng phim phải lớn hơn 0 phút"],
        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        releaseDate: {
            type: Date,
            required: [true, "Phim phải có ngày khởi chiếu"],
        },
        status: {
            type: String,
            enum: ["NOW_SHOWING", "COMING_SOON"],
            default: "COMING_SOON",
        },
        description: {
            type: String,
            required: [true, "Phim phải có mô tả"],
            trim: true,
        },
        posterUrl: {
            type: String,
            required: [true, "Phim phải có poster"],
        },
        publishStatus: {
            type: String,
            enum: ["DRAFT", "PUBLISHED"],
            default: "PUBLISHED",
        },
        trailerUrl: {
            type: String,
            required: [true, "Phim phải có trailer"],
        },
        slug: {
            type: String,
            unique: true,
        },
        age: {
            type: Number,
            required: [true, "Phim phải có giới hạn độ tuổi"],
            enum: [0, 13, 16, 18],
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
        nation: {
            type: String,
            required: [true, "Phim phải có quốc gia"],
            trim: true,
        },
        format: {
            type: [String],
            enum: ["2D", "3D", "IMAX", "4DX"],
            required: [true, "Phim phải có định dạng"],
            default: "2D",
        },
    },

    {
        timestamps: true,
    }
);

// Tự động tạo slug từ tên phim
movieSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {lower: true, strict: true, locale: "vi"});
    }
    next();
});

// Tự động cập nhật trạng thái
movieSchema.pre("save", function (next) {
    this.status = this.releaseDate <= new Date() ? "NOW_SHOWING" : "COMING_SOON";
    next();
});

// Phương thức tĩnh để lấy danh sách phim đang chiếu
// movieSchema.statics.getNowShowing = function() {
//     return this.find({ status: 'NOW_SHOWING' })
//                .sort('-release_date');
// };

// Phương thức tĩnh để lấy danh sách phim sắp chiếu
// movieSchema.statics.getComingSoon = function() {
//     return this.find({ status: 'COMING_SOON' })
//                .sort('release_date');
// };

// Phương thức của instance để cập nhật thống kê đánh giá
// movieSchema.methods.updateRatingStats = async function() {
//     const Rating = mongoose.model('Rating');
//     const stats = await Rating.aggregate([
//         {
//             $match: { movie_id: this._id }
//         },
//         {
//             $group: {
//                 _id: '$movie_id',
//                 avgRating: { $avg: '$rating' },
//                 count: { $sum: 1 }
//             }
//         }
//     ]);
//
//     if (stats.length > 0) {
//         this.ratings_average = stats[0].avgRating;
//         this.ratings_quantity = stats[0].count;
//     } else {
//         this.ratings_average = 0;
//         this.ratings_quantity = 0;
//     }
//
//     return this.save();
// };

// tự động populate các thông tin liên quan khi query
// movieSchema.pre(/^find/, function(next) {
//     this.populate({
//         path: 'director_id',
//         select: 'name'
//     })
//     .populate({
//         path: 'genres_id',
//         select: 'name'
//     })
//     .populate({
//         path: 'cast_id',
//         select: 'name'
//     });
//
//     next();
// });

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
