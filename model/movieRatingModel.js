const mongoose = require('mongoose');

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
  const movie = mongoose.model('Movie');
  if (stats.length > 0) {
    await movie.findByIdAndUpdate(movieId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
      // giá trị mặc định nếu không có đánh giá.
      await movie.findByIdAndUpdate(movieId, {
        ratingsAverage: 0,
        ratingsQuantity: 0
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

movieRatingSchema.post(/^findOneAnd/, async function() {
  // Lưu ý: this.r chứa document trước khi cập nhật/xóa
  // Nếu this.r tồn tại, tính toán lại thống kê đánh giá
  if (this.r) {
    await this.r.constructor.calcAverageRating(this.r.movieId);
  }
});

const MovieRating = mongoose.model('MovieRating', movieRatingSchema);

module.exports = MovieRating;