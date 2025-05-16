const ResetPassword = require('../model/resetPasswordModel');
const crypto = require("crypto");

const generateToken = async (userId) => {
    await clearToken(userId);
    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await ResetPassword.create({
        token: hashedToken,
        user: userId,
        expired: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    return token;
}

const clearToken = async (userId) => {
    await ResetPassword.deleteMany({
        user: userId
    });
}

const verifyResetPassword = async(userId, hashedToken) => {
    const resetPassword = await ResetPassword.findOne(
        {
                user: userId,
                token: hashedToken,
            }
        );

    if (!resetPassword) return false;

    if(resetPassword.expired < new Date()) {
        await resetPassword.deleteOne();
        return false;
    }

    await resetPassword.deleteOne();
    return true;
}

module.exports = {
    generateToken,
    clearToken,
    verifyResetPassword
};


