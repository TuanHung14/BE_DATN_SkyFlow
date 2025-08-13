const { GoogleGenerativeAI } = require("@google/generative-ai");

const { getChatHistory, saveChatHistory } = require("./redis");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const createChatSession = async (sessionId) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: { temperature: 0.5 },
    });

    const history = await getChatHistory(sessionId);

    const chat = model.startChat({ history });

    return { chat, history };
};

const chatAI = async (prompt, systemInstruction, sessionId) => {
    const { chat, history } = await createChatSession(sessionId);

    const fullPrompt = `${systemInstruction}\n\nYêu cầu cụ thể: ${prompt}`;

    const result = await chat.sendMessage(fullPrompt);
    // const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    const his = history.map((item) => {
        if (item.role === "user") {
            item.parts = [
                {
                    text: prompt
                }
            ];
        }
        return item;
    })
    await saveChatHistory(sessionId, his);

    return text.replace(/```html\s*/i, '')
        .replace(/```[\s\S]*$/, '')
        .replace(/\r?\n|\r/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = chatAI;