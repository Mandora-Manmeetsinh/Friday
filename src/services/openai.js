import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY",
  dangerouslyAllowBrowser: true, // Required for frontend-only execution
});

export const getOpenAIResponse = async (messages, memories = []) => {
  try {
    // Convert our internal message format to OpenAI's format
    const formattedMessages = messages.map(msg => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.text
    }));

    const memoryContext = memories.length > 0
      ? `\n\nImportant stored memory/preferences of the user:\n${memories.map(m => `- ${m}`).join('\n')}`
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are FRIDAY, an advanced AI assistant inspired by Iron Man.

Personality:
- intelligent
- concise
- slightly witty
- helpful like a technical assistant

Behavior:
- give clear structured answers
- avoid unnecessary long explanations
- act like a personal AI assistant, not a generic chatbot${memoryContext}`
        },
        ...formattedMessages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "I'm sorry, I seem to be experiencing a network anomaly. My diagnostics indicate an issue reaching the server.";
  }
};
