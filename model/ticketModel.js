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
          return seat ? true : false;
        },
        message: 'Ghế không tồn tại trong hệ thống'
      }
    },
    price: {
      type: Number,
      required: [true, 'Giá ghế không được để trống'],
      min: [0, 'Giá ghế không thể âm']
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
          return food ? true : false;
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
    required: [true, 'Ngày đặt vé không được để trống'],
    default: Date.now
  },

  total_amount: {
    type: Number,
    required: [true, 'Tổng tiền không được để trống'],
    min: [0, 'Tổng tiền không thể âm']
  },

  payment_status: {
    type: String,
    required: [true, 'Trạng thái thanh toán không được để trống'],
    enum: {
      values: ['Pending', 'Paid', 'Failed', 'Refunded'],
      message: 'Trạng thái thanh toán không hợp lệ'
    },
    default: 'Pending'
  },

  booking_status: {
    type: String,
    required: [true, 'Trạng thái đặt vé không được để trống'],
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
    validate: {
      validator: async function(value) {
        const Showtime = mongoose.model('Showtime');
        const showtime = await Showtime.findById(value);
        return showtime ? true : false;
      },
      message: 'Suất chiếu không tồn tại trong hệ thống'
    }
  },

  payment_method_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: [true, 'ID phương thức thanh toán không được để trống'],
    validate: {
      validator: async function(value) {
        const PaymentMethod = mongoose.model('PaymentMethod');
        const paymentMethod = await PaymentMethod.findById(value);
        return paymentMethod ? true : false;
      },
      message: 'Phương thức thanh toán không tồn tại trong hệ thống'
    }
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng không được để trống'],
    validate: {
      validator: async function(value) {
        const User = mongoose.model('User');
        const user = await User.findById(value);
        return user ? true : false;
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
  toObject: { virtuals: true }
});

const Ticket = mongoose.model('Ticket', ticketSchema);