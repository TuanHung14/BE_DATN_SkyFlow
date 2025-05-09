const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Không được để trống"],
    },
    address: {
      type: String,
      required: [true, "Không được để trống"],
    },
    contactEmail: { type: String, required: [true, "Không được để trống"] },
    phoneNumber: { type: String, required: [true, "Không được để trống"] },
    logoUrl: { type: String, required: [true, "Không được để trống"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
