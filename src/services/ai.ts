import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Initialize with empty key, will be set after fetching from Supabase
let GEMINI_API_KEY: string | null = null;

// Function to fetch API key from Supabase
const fetchApiKey = async () => {
  try {
    console.log('Fetching Gemini API key from environment...');
    
    const { data: { secret }, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'GEMINI_API_KEY')
      .single();
    
    if (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
    
    if (!secret) {
      console.error('No API key found');
      throw new Error('API key not found');
    }
    
    console.log('Successfully fetched Gemini API key');
    GEMINI_API_KEY = secret;
    return true;
  } catch (error) {
    console.error('Error fetching Gemini API key:', error);
    toast({
      title: "Configuration Error",
      description: "Failed to fetch Gemini API key. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

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
  // Ensure we have the API key
  if (!GEMINI_API_KEY) {
    console.log('No API key found, attempting to fetch...');
    const success = await fetchApiKey();
    if (!success) {
      throw new Error("Failed to initialize Gemini API. Please check your configuration.");
    }
  }

  const agent = AGENT_ROLES[agentName];
  if (!agent) {
    throw new Error("Invalid agent name");
  }

  try {
    console.log('Initializing Gemini with API key...');
    const model = new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are ${agent.name}, the ${agent.role} at AIGency, a marketing agency.
Your personality: ${agent.personality}

Chat history:
${chatHistory.map(msg => `${msg.sender}: ${msg.content}`).join("\n")}

User's message: ${userMessage}

Respond in character as ${agent.name}, keeping your response focused on your role as ${agent.role}. Be professional but show personality.`;

    console.log('Generating response...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    toast({
      title: "Error",
      description: "Failed to generate response. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};