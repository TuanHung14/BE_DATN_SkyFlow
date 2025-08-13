const Redis = require("ioredis");

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    // tls: {},
});

const getChatHistory = async (sessionId) => {
    const data = await redis.get(`chat:history:${sessionId}`);
    return data ? JSON.parse(data) : [];
};

const saveChatHistory = async (sessionId, history) => {
    // Lưu và đặt TTL = 600 giây (10 phút)
    await redis.set(`chat:history:${sessionId}`, JSON.stringify(history), 'EX', 600);
};

const resetChatHistory = async (sessionId) => {
    await redis.del(`chat:history:${sessionId}`);
};

module.exports = {
    redis,
    getChatHistory,
    saveChatHistory,
    resetChatHistory
}

