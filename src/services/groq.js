export const getGroqResponse = async (messages, memories = []) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file.");
  }

  // Convert our internal message format to OpenAI/Groq compatible format
  const formattedMessages = messages.map(msg => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));

  const memoryContext = memories.length > 0 
    ? `\n\nImportant stored memory/preferences of the user:\n${memories.map(m => `- ${m}`).join('\n')}` 
    : "";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Updated to current high performance Llama model on Groq
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
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error);
    return "I'm sorry, I seem to be experiencing a network anomaly. My diagnostics indicate an issue reaching the Groq processing nodes.";
  }
};

export const getCommandIntent = async (text) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return { action: "chat" };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `You are an intent classifier. Convert the user input into a JSON object.
Return JSON ONLY. No extra text.
If it's a web automation command, return: {"action": "<action_type>", "query": "<search_query_if_applicable>"}.
Action types: "open_site", "search_google", "youtube_search", "github_search".
If the input is just normal conversation, return: {"action": "chat"}.`
          },
          { role: "user", content: text }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to get intent");
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Intent parsing error:", error);
    return { action: "chat" }; // Fallback
  }
};
