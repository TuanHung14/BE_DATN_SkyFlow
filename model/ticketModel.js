const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketCode: {
    type: String,
    required: [true, 'Mã vé không được để trống'],
    unique: true,
    trim: true,
    match: [/^TICKET_\d{6}$/, 'Mã vé phải có định dạng TICKET_123456 (6 chữ số)']
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  appTransId: {
    type: String,
    default: null
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

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;