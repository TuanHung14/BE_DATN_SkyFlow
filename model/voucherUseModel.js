const mongoose = require('mongoose');

const voucherUseSchema = new mongoose.Schema({
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

  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: [true, 'ID voucher không được để trống'],
    trim: true,
    index: true,
    validate: {
      validator: async function(value) {
        const Voucher = mongoose.model('Voucher');
        const voucher = await Voucher.findById(value);
        return voucher ? true : false;
      },
      message: 'Voucher không tồn tại trong hệ thống'
    }
  },

  usage_limit: {
    type: Number,
    required: [true, 'Giới hạn sử dụng không được để trống'],
    min: [1, 'Giới hạn sử dụng phải lớn hơn hoặc bằng 1'],
    max: [100, 'Giới hạn sử dụng không được vượt quá 100 lần'],
    validate: {
      validator: Number.isInteger,
      message: 'Giới hạn sử dụng phải là số nguyên'
    }
  },

  usage_count: {
    type: Number,
    default: 0,
    min: [0, 'Số lần sử dụng không thể âm'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value <= this.usage_limit;
      },
      message: 'Số lần sử dụng phải là số nguyên và không được vượt quá giới hạn'
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

const VoucherUse = mongoose.model('VoucherUse', voucherUseSchema);