const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  seatsId: [{
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: [true, 'ID ghế không được để trống'],
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
  foodsId: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: [true, 'ID đồ ăn không được để trống'],
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
  bookingDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: [true, 'Tổng tiền không được để trống'],
    min: [0, 'Tổng tiền không thể âm'],
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} không phải là tổng tiền hợp lệ'
    }
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['Pending', 'Paid', 'Failed', 'Refunded'],
      message: 'Trạng thái thanh toán không hợp lệ'
    },
    default: 'Pending'
  },
  bookingStatus: {
    type: String,
    enum: {
      values: ['Reserved', 'Confirmed', 'Cancelled'],
      message: 'Trạng thái đặt vé không hợp lệ'
    },
    default: 'Reserved'
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: [true, 'ID suất chiếu không được để trống'],
    index: true,
  },
  paymentMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: [true, 'ID phương thức thanh toán không được để trống'],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng không được để trống'],
    index: true,
  }
}, {
  timestamps: true
});

// Thêm index cho seat_id
ticketSchema.index({ 'seatsId.seatId': 1 });
ticketSchema.index({ showtimeId: 1, 'seatsId.seatId': 1 }, { unique: true });

const Ticket = mongoose.model('Ticket', ticketSchema);