const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề banner không được để trống'],
    trim: true,
    minlength: [3, 'Tiêu đề banner phải có ít nhất 3 ký tự'],
    maxlength: [100, 'Tiêu đề banner không được vượt quá 100 ký tự']
  },
  image_url: {
    type: String,
    required: [true, 'URL hình ảnh banner không được để trống'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inActive'],
      message: '{VALUE} không phải là trạng thái hợp lệ'
    },
    default: 'active'
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

bannerSchema.index({ title: 'text' }); // tìm kiếm theo text

// Phương thức để chuyển đổi trạng thái banner
// bannerSchema.methods.toggleStatus = function() {
//   this.status = this.status === 'active' ? 'inActive' : 'active';
//   return this.save();
// };

// Phương thức static để lấy danh sách banner đang active
// bannerSchema.statics.getActiveBanners = function() {
//   return this.find({ status: 'active' });
// };

// Middleware trước khi lưu
// bannerSchema.pre('save', function(next) {
//   next();
// });

const Banner = mongoose.model('Banner', bannerSchema);