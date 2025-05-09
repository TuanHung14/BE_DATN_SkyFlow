const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true,
    },
    address: String,
    contact_email: String,
    phone_number: String,
    logo_url: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
