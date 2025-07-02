const Factory = require("./handleFactory");
const PriceRule = require("../model/priceRuleModel");

exports.getAllPriceRules = Factory.getAll(PriceRule, 'formats');

exports.createPriceRule = Factory.createOne(PriceRule);

exports.updatePriceRule = Factory.updateOne(PriceRule);