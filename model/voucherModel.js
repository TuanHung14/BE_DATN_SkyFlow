const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const voucherSchema = new mongoose.Schema(
  {
    voucherCode: {
      type: String,
      required: [true, "Không được để trống"],
      unique: true,
      trim: true,
    },
    voucherName: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Không được để trống"],
      min: 0,
    },
    minimumOrderAmount: {
      type: Number,
      required: [true, "Không được để trống"],
      min: 0,
    },
    points: {
      type: Number,
      required: [true, "Không được để trống"],
      min: 0,
    },
    description: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

voucherSchema.pre("save", function (next){
  if(this.minimumOrderAmount < (this.discountValue+ 10000)){
    return next(new AppError("Giá trị giảm giá không được lớn hơn tổng giá trị đơn hàng tối thiểu", 400));
  }
  next();
});

voucherSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.minimumOrderAmount < (update.discountValue + 10000)) {
    return next(new AppError("Giá trị giảm giá không được lớn hơn tổng giá trị đơn hàng tối thiểu", 400));
  }
  next();
});

module.exports = mongoose.model("Voucher", voucherSchema);
