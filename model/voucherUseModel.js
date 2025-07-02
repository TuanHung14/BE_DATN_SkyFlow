const mongoose = require('mongoose');

const voucherUseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng không được để trống'],
    index: true,
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: [true, 'ID voucher không được để trống'],
    index: true,
  },
  usageLimit: {
    type: Number,
    required: [true, 'Giới hạn sử dụng không được để trống'],
    min: [1, 'Giới hạn sử dụng phải lớn hơn hoặc bằng 1'],
    max: [100, 'Giới hạn sử dụng không được vượt quá 100 lần'],
    validate: {
      validator: Number.isInteger,
      message: 'Giới hạn sử dụng phải là số nguyên'
    }
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Số lần sử dụng không thể âm'],
  }
}, {
  timestamps: true
});

// Thêm index kết hợp để đảm bảo mỗi user chỉ dùng một voucher một lần
voucherUseSchema.index({ userId: 1, voucherId: 1 }, { unique: true });

const VoucherUse = mongoose.model('VoucherUse', voucherUseSchema);

module.exports = VoucherUse;