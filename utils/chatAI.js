const { GoogleGenerativeAI } = require("@google/generative-ai");
const Redis = require("ioredis");

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    // tls: {},
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

const createChatSession = async (sessionId) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: { temperature: 0.1 },
    });

    const history = await getChatHistory(sessionId);

    const chat = model.startChat({ history });

    return { chat, history };
};

const chatAI = async (prompt, systemInstruction, sessionId) => {
    const { chat, history } = await createChatSession(sessionId);
    let fullPrompt = prompt;

    if(history.length === 0) {
        fullPrompt = `${systemInstruction}\n\nYêu cầu cụ thể: ${prompt}`;
    }

    const result = await chat.sendMessage(fullPrompt);
    // const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // history.push({ role: "user", parts: [prompt] });
    // history.push({ role: "model", parts: [text] });
    await saveChatHistory(sessionId, history);

    return text.replace(/```html\s*/i, '')
        .replace(/```[\s\S]*$/, '')
        .replace(/\r?\n|\r/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = chatAI;