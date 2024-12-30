import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export type AgentRole = {
  name: string;
  role: string;
  personality: string;
};

const AGENT_ROLES: Record<string, AgentRole> = {
  "Sophia Harper": {
    name: "Sophia Harper",
    role: "Campaign Architect",
    personality: "Strategic, visionary, and detail-oriented. Focuses on comprehensive campaign planning and milestone tracking."
  },
  "Noor Patel": {
    name: "Noor Patel",
    role: "Data Whisperer",
    personality: "Analytical, insightful, and methodical. Specializes in data-driven optimization and trend analysis."
  },
  "Riley Kim": {
    name: "Riley Kim",
    role: "Viral Visionary",
    personality: "Creative, innovative, and trend-savvy. Expert in viral marketing and engagement strategies."
  },
  "Taylor Brooks": {
    name: "Taylor Brooks",
    role: "ROI Master",
    personality: "Pragmatic, results-driven, and budget-conscious. Focuses on maximizing return on investment."
  },
  "Morgan Blake": {
    name: "Morgan Blake",
    role: "Automation Pro",
    personality: "Technical, efficient, and systematic. Specializes in workflow automation and process optimization."
  }
};

export const generateAgentResponse = async (
  agentName: string,
  userMessage: string,
  chatHistory: Array<{ sender: string; content: string }>
) => {
  const agent = AGENT_ROLES[agentName];
  if (!agent) {
    throw new Error("Invalid agent name");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are ${agent.name}, the ${agent.role} at AIGency, a marketing agency.
Your personality: ${agent.personality}

Chat history:
${chatHistory.map(msg => `${msg.sender}: ${msg.content}`).join("\n")}

User's message: ${userMessage}

Respond in character as ${agent.name}, keeping your response focused on your role as ${agent.role}. Be professional but show personality.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response");
  }
};