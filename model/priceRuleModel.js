const mongoose = require('mongoose');

const priceRuleSchema = new mongoose.Schema({
  seatType: {
    type: String,
    enum: {
      values: ['normal', 'vip', 'couple'],
      message: '{VALUE} is not a valid seat type'
    },
    // required: [true, 'Seat type is required'],
    trim: true
  },
  format: {
    type: String,
    enum: {
      values: ['2D', '3D', 'IMAX', '4DX']
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid price'
    }
  }
}, {
  timestamps: true
});

// priceRuleSchema.index({ seatType: 1 }, { unique: true });

const PriceRule = mongoose.model('PriceRule', priceRuleSchema);

module.exports = PriceRule;