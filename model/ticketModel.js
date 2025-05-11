const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  seats_id: [{
    seat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: [true, 'ID ghế không được để trống'],
      validate: {
        validator: async function(value) {
          const Seat = mongoose.model('Seat');
          const seat = await Seat.findById(value);
          return !!seat;
        },
        message: 'Ghế không tồn tại trong hệ thống'
      }
    },
    price: {
      type: Number,
      required: [true, 'Giá ghế không được để trống'],
      min: [0, 'Giá ghế không thể âm'],
      validate: {
        validator: Number.isFinite,
        message: '{VALUE} không phải là giá hợp lệ'
      }
    }
  }],
  foods_id: [{
    food_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: [true, 'ID đồ ăn không được để trống'],
      validate: {
        validator: async function(value) {
          const Food = mongoose.model('Food');
          const food = await Food.findById(value);
          return !!food;
        },
        message: 'Đồ ăn không tồn tại trong hệ thống'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng không được để trống'],
      min: [1, 'Số lượng phải lớn hơn 0'],
      validate: {
        validator: Number.isInteger,
        message: 'Số lượng phải là số nguyên'
      }
    }
  }],
  booking_date: {
    type: Date,
    default: Date.now
  },
  total_amount: {
    type: Number,
    required: [true, 'Tổng tiền không được để trống'],
    min: [0, 'Tổng tiền không thể âm'],
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} không phải là tổng tiền hợp lệ'
    }
  },
  payment_status: {
    type: String,
    enum: {
      values: ['Pending', 'Paid', 'Failed', 'Refunded'],
      message: 'Trạng thái thanh toán không hợp lệ'
    },
    default: 'Pending'
  },
  booking_status: {
    type: String,
    enum: {
      values: ['Reserved', 'Confirmed', 'Cancelled'],
      message: 'Trạng thái đặt vé không hợp lệ'
    },
    default: 'Reserved'
  },
  showtime_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: [true, 'ID suất chiếu không được để trống'],
    index: true,
    validate: {
      validator: async function(value) {
        const Showtime = mongoose.model('Showtime');
        const showtime = await Showtime.findById(value);
        return !!showtime;
      },
      message: 'Suất chiếu không tồn tại trong hệ thống'
    }
  },
  payment_method_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: [true, 'ID phương thức thanh toán không được để trống'],
    index: true,
    validate: {
      validator: async function(value) {
        const PaymentMethod = mongoose.model('PaymentMethod');
        const paymentMethod = await PaymentMethod.findById(value);
        return !!paymentMethod;
      },
      message: 'Phương thức thanh toán không tồn tại trong hệ thống'
    }
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng không được để trống'],
    index: true,
    validate: {
      validator: async function(value) {
        const User = mongoose.model('User');
        const user = await User.findById(value);
        return !!user;
      },
      message: 'Người dùng không tồn tại trong hệ thống'
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
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Thêm index cho seat_id
ticketSchema.index({ 'seats_id.seat_id': 1 });
ticketSchema.index({ showtime_id: 1, 'seats_id.seat_id': 1 }, { unique: true });

const Ticket = mongoose.model('Ticket', ticketSchema);