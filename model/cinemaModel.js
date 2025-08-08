const mongoose = require("mongoose");
const slugify = require("slugify");

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    province: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    district: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    ward: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: false,
    },
    img: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Tạo slug trước khi save
cinemaSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Tạo index cho location
cinemaSchema.index({ location: "2dsphere" });

const Cinema = mongoose.model("Cinema", cinemaSchema);
module.exports = Cinema;
