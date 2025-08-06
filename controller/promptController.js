const Factory = require('./handleFactory');
const Prompt = require('../model/promptModel');

exports.fieldClient = (req, res, next) => {
    req.query.status = "active";
    next();
};

exports.getPrompt = Factory.getAll(Prompt);