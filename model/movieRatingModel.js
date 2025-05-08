const mongoose = require('mongoose');

const movieRatingSchema = new mongoose.Schema({
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'ID phim không được để trống'],
    trim: true,
    index: true,
    validate: {
      validator: async function(value) {
        const Movie = mongoose.model('Movie');
        const movie = await Movie.findById(value);
        return movie ? true : false;
      },
      message: 'Phim không tồn tại trong hệ thống'
    }
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng không được để trống'],
    trim: true,
    index: true,
    validate: {
      validator: async function(value) {
        const User = mongoose.model('User');
        const user = await User.findById(value);
        return user ? true : false;
      },
      message: 'Người dùng không tồn tại trong hệ thống'
    }
  },

  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Bình luận không được vượt quá 500 ký tự'],
    validate: {
      validator: function(value) {
        // Kiểm tra nội dung comment không chứa từ ngữ không phù hợp
        const invalidWords = ['fuck', 'shit', 'dm'];
        return !invalidWords.some(word => value.toLowerCase().includes(word));
      },
      message: 'Bình luận chứa nội dung không phù hợp'
    }
  },

  rating: {
    type: Number,
    required: [true, 'Điểm đánh giá không được để trống'],
    min: [1, 'Điểm đánh giá phải từ 1-5'],
    max: [5, 'Điểm đánh giá phải từ 1-5'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Điểm đánh giá phải là số nguyên'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

const MovieRating = mongoose.model('MovieRating', movieRatingSchema);