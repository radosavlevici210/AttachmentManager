import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface DataAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  trends: string[];
}

export interface ChatResponse {
  message: string;
  context?: any;
}

export async function analyzeData(data: any[], query: string): Promise<DataAnalysisResult> {
  try {
    const prompt = `
    Analyze the following data and provide insights based on the user query: "${query}"
    
    Data (first 10 rows as sample):
    ${JSON.stringify(data.slice(0, 10), null, 2)}
    
    Please provide your analysis in JSON format with the following structure:
    {
      "summary": "Brief summary of the data",
      "insights": ["Key insight 1", "Key insight 2", ...],
      "recommendations": ["Recommendation 1", "Recommendation 2", ...],
      "trends": ["Trend 1", "Trend 2", ...]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a data analysis expert. Analyze the provided data and respond with detailed insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      summary: result.summary || "No summary available",
      insights: result.insights || [],
      recommendations: result.recommendations || [],
      trends: result.trends || []
    };
  } catch (error) {
    console.error("Error analyzing data:", error);
    throw new Error("Failed to analyze data with AI");
  }
}

export async function chatWithAssistant(
  message: string, 
  context?: any,
  chatHistory?: { message: string; response: string }[]
): Promise<ChatResponse> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: `You are an AI assistant specialized in data analysis and helping users with their uploaded files and data. 
        You can help with CSV analysis, JSON parsing, data visualization insights, and general data questions.
        Keep responses concise but informative. Use emojis sparingly and professionally.`
      }
    ];

    // Add chat history for context
    if (chatHistory) {
      chatHistory.slice(-5).forEach(chat => {
        messages.push(
          { role: "user" as const, content: chat.message },
          { role: "assistant" as const, content: chat.response }
        );
      });
    }

    // Add context if available
    if (context) {
      messages.push({
        role: "system" as const,
        content: `Additional context: ${JSON.stringify(context, null, 2)}`
      });
    }

    messages.push({
      role: "user" as const,
      content: message
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      message: response.choices[0].message.content || "I'm sorry, I couldn't process your request.",
      context: context
    };
  } catch (error) {
    console.error("Error in chat:", error);
    throw new Error("Failed to get AI response");
  }
}

export async function analyzeWebsiteContent(content: string, url: string): Promise<string> {
  try {
    const prompt = `
    Analyze the following website content from ${url}:
    
    ${content.slice(0, 2000)}...
    
    Provide a brief analysis including:
    - Main purpose/topic of the website
    - Key information found
    - Structure and content type
    - Any notable features
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a web content analyzer. Provide concise analysis of website content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Unable to analyze website content.";
  } catch (error) {
    console.error("Error analyzing website:", error);
    throw new Error("Failed to analyze website content");
  }
}
