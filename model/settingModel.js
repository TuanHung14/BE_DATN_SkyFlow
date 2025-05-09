const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contact_email: { type: String, required: true },
    phone_number: { type: String, required: true },
    logo_url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
