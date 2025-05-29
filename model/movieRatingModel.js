const mongoose = require('mongoose');
const movieModel = require('./movieModel');

const movieRatingSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'ID phim không được để trống'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: [true, 'ID người dùng không được để trống'],
    index: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Bình luận không được vượt quá 500 ký tự']
  },
  rating: {
    type: Number,
    required: [true, 'Điểm đánh giá không được để trống'],
    min: [1, 'Điểm đánh giá phải từ 1-5'],
    max: [5, 'Điểm đánh giá phải từ 1-5']
  }
}, {
  timestamps: true
});

// mỗi người chỉ được đánh giá một phim một lần
movieRatingSchema.index({ movieId: 1, userId: 1 }, { unique: true });

// tính toán thống kê đánh giá cho một phim
movieRatingSchema.statics.calcAverageRating = async function(movieId) {
  const stats = await this.aggregate([
    {
      $match: { movieId: new mongoose.Types.ObjectId(movieId) }
    },
    {
      $group: {
        _id: '$movieId',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 }
      }
    }
  ]);

  // cập nhập movie với thống kê mới
  if (stats.length > 0) {
    await movieModel.findByIdAndUpdate(movieId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  }
}

// tự động cập nhật thống kê sau khi lưu đánh giá mới
movieRatingSchema.post('save', async function() {
  await this.constructor.calcAverageRating(this.movieId);
});

movieRatingSchema.pre(/^findOneAnd/, async function(next) {
  // this là query, không phải document
  // Lưu document hiện tại vào this.r để sử dụng trong middleware post
  this.r = await this.findOne().clone();
  next();
});

movieRatingSchema.post(/^findOneAnd/, async function(docs) {
  if (docs) {
    await this.model.calcAverageRating(docs.movieId);
  }
})

const MovieRating = mongoose.model('MovieRating', movieRatingSchema);

module.exports = MovieRating;