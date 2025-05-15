const mongoose = require('mongoose');

const priceRuleSchema = new mongoose.Schema({
  seat_type: {
    type: String,
    enum: {
      values: ['normal', 'vip', 'couple'],
      message: '{VALUE} is not a valid seat type'
    },
    required: [true, 'Seat type is required'],
    trim: true
  },
  age_group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerGroup',
    required: [true, 'Age group is required'],
    index: true,
    validate: {
      validator: async function(value) {
        const CustomerGroup = mongoose.model('CustomerGroup');
        const group = await CustomerGroup.findById(value);
        return !!group;
      },
      message: 'Customer group does not exist'
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

priceRuleSchema.index({ seat_type: 1, age_group: 1 }, { unique: true });

const PriceRule = mongoose.model('PriceRule', priceRuleSchema);

module.exports = PriceRule;