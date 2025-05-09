const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: [true, "Không được để trống"],
    },
    address: {
      type: String,
      required: [true, "Không được để trống"],
    },
    contact_email: { type: String, required: [true, "Không được để trống"] },
    phone_number: { type: String, required: [true, "Không được để trống"] },
    logo_url: { type: String, required: [true, "Không được để trống"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
