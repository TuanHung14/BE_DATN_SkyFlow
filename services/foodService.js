const Food = require('../model/foodModel');
const AppError = require('../utils/appError');

const getFoodList = async () => {
    try {
        const foods = await Food.find({ isDeleted: false, status: "active" })
            .sort({ createdAt: -1 });
        return foods;
    } catch (error) {
        throw new AppError("Could not fetch food list", 500);
    }
}

module.exports = {
    getFoodList
};