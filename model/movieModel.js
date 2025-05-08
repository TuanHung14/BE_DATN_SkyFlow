const mongoose = require('mongoose');
const slugify = require('slugify');

const movieSchema = new mongoose.Schema({
    director_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MovieEntity',
        required: [true, 'Phim phải có đạo diễn'],
        validate: {
            validator: async function(value) {
                try {
                    const MovieEntity = mongoose.model('MovieEntity');
                    const director = await MovieEntity.findById(value);
                    return director !== null;
                } catch (error) {
                    return false;
                }
            },
            message: 'Đạo diễn không tồn tại'
        }
    },
    genres_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MovieEntity',
        validate: {
            validator: async function(value) {
                try {
                    const MovieEntity = mongoose.model('MovieEntity');
                    const genre = await MovieEntity.findById(value);
                    return genre !== null;
                } catch (error) {
                    return false;
                }
            },
            message: 'Thể loại không tồn tại'
        }
    }],
    cast_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MovieEntity',
        validate: {
            validator: async function(value) {
                try {
                    const MovieEntity = mongoose.model('MovieEntity');
                    const cast = await MovieEntity.findById(value);
                    return cast !== null;
                } catch (error) {
                    return false;
                }
            },
            message: 'Diễn viên không tồn tại'
        }
    }],
    name: {
        type: String,
        required: [true, 'Phim phải có tên'],
        trim: true,
        minLength: [2, 'Tên phim phải có ít nhất 2 ký tự'],
        maxLength: [100, 'Tên phim không được vượt quá 100 ký tự']
    },
    duration: {
        type: Number,
        required: [true, 'Phim phải có thời lượng'],
        min: [1, 'Thời lượng phim phải lớn hơn 0 phút'],
        max: [500, 'Thời lượng phim không được vượt quá 500 phút']
    },
    ratings_average: {
        type: Number,
        default: 0,
        min: [0, 'Điểm đánh giá không được thấp hơn 0'],
        max: [10, 'Điểm đánh giá không được vượt quá 10'],
        set: val => Math.round(val * 10) / 10 // Làm tròn đến 1 chữ số thập phân
    },
    ratings_quantity: {
        type: Number,
        default: 0,
        min: [0, 'Số lượng đánh giá không được âm']
    },
    release_date: {
        type: Date,
        required: [true, 'Phim phải có ngày khởi chiếu'],
        validate: {
            validator: function(value) {
                // Kiểm tra ngày khởi chiếu không được sớm hơn 1 năm so với hiện tại
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                return value >= oneYearAgo;
            },
            message: 'Ngày khởi chiếu không hợp lệ'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['COMING_SOON', 'NOW_SHOWING'],
            message: '{VALUE} không phải là trạng thái hợp lệ'
        },
        required: [true, 'Phim phải có trạng thái']
    },
    description: {
        type: String,
        required: [true, 'Phim phải có mô tả'],
        trim: true,
        minLength: [10, 'Mô tả phim phải có ít nhất 10 ký tự'],
        maxLength: [2000, 'Mô tả phim không được vượt quá 2000 ký tự']
    },
    poster_url: {
        type: String,
        required: [true, 'Phim phải có poster'],
        validate: {
            validator: function(v) {
                // Kiểm tra URL cơ bản
                return /^(http|https):\/\/[^ "]+$/.test(v);
            },
            message: props => `${props.value} không phải là URL hợp lệ!`
        }
    },
    trailer_url: {
        type: String,
        required: [true, 'Phim phải có trailer'],
        validate: {
            validator: function(v) {
                // Kiểm tra đường dẫn youtube
                return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
            },
            message: props => `${props.value} không phải là URL YouTube hợp lệ!`
        }
    },
    slug: {
        type: String,
        unique: true
    },
    age: {
        type: Number,
        required: [true, 'Phim phải có giới hạn độ tuổi'],
        enum: {
            values: [0, 13, 16, 18],
            message: '{VALUE} không phải là giới hạn độ tuổi hợp lệ'
        }
    },
    nation: {
        type: String,
        required: [true, 'Phim phải có quốc gia'],
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Tạo virtual field để lấy danh sách đánh giá của phim
movieSchema.virtual('ratings', {
    ref: 'Rating',
    foreignField: 'movie_id',
    localField: '_id'
});

// tự động tạo slug từ tên phim trước khi lưu
movieSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }
    next();
});

// tự động cập nhật trạng thái dựa vào ngày khởi chiếu
movieSchema.pre('save', function(next) {
    const now = new Date();
    if (this.release_date <= now) {
        this.status = 'NOW_SHOWING';
    } else {
        this.status = 'COMING_SOON';
    }
    next();
});

// Phương thức tĩnh để lấy danh sách phim đang chiếu
movieSchema.statics.getNowShowing = function() {
    return this.find({ status: 'NOW_SHOWING' })
               .sort('-release_date');
};

// Phương thức tĩnh để lấy danh sách phim sắp chiếu
movieSchema.statics.getComingSoon = function() {
    return this.find({ status: 'COMING_SOON' })
               .sort('release_date');
};

// Phương thức của instance để cập nhật thống kê đánh giá
movieSchema.methods.updateRatingStats = async function() {
    const Rating = mongoose.model('Rating');
    const stats = await Rating.aggregate([
        {
            $match: { movie_id: this._id }
        },
        {
            $group: {
                _id: '$movie_id',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        this.ratings_average = stats[0].avgRating;
        this.ratings_quantity = stats[0].count;
    } else {
        this.ratings_average = 0;
        this.ratings_quantity = 0;
    }

    return this.save();
};

// tự động populate các thông tin liên quan khi query
movieSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'director_id',
        select: 'name'
    })
    .populate({
        path: 'genres_id',
        select: 'name'
    })
    .populate({
        path: 'cast_id',
        select: 'name'
    });

    next();
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;