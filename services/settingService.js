const Setting = require("../model/settingModel");

const settingService = {
  async getAllSettings() {
    return await Setting.find();
  },

  async getSettingById(id) {
    return await Setting.findById(id);
  },

  async createSetting(data) {
    return await Setting.create(data);
  },

  async updateSetting(id, data) {
    return await Setting.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteSetting(id) {
    return await Setting.findByIdAndDelete(id);
  },
};

module.exports = settingService;
