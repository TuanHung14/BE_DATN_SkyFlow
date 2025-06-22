const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatAI = async (prompt, systemInstruction) => {
    const model = genAI.getGenerativeModel(
        {
            model: "gemini-2.0-flash-exp", generationConfig: {
            temperature: 0.1,
        } });

    const fullPrompt = `${systemInstruction}\n\nYêu cầu cụ thể: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    return text.replace(/```html\s*/i, '')
        .replace(/```[\s\S]*$/, '')
        .replace(/\r?\n|\r/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = chatAI;