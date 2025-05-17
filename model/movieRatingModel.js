const mongoose = require('mongoose');

const movieRatingSchema = new mongoose.Schema({
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'ID phim không được để trống'],
    index: true
  },
  user_id: {
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const MovieRating = mongoose.model('MovieRating', movieRatingSchema);