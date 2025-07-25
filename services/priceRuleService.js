const PriceRule = require('../model/priceRuleModel');

const getTicketPrices = async () => {
    try {
        const priceRule = await PriceRule.find().populate('formats');
        return priceRule;
    } catch (error) {
        return { error: 'Chat AI đang lỗi vui lòng thử lại sau' };
    }
}

module.exports = {
    getTicketPrices
}