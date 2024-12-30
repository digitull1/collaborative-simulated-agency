import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

let GEMINI_API_KEY: string | null = null;

const fetchApiKey = async () => {
  try {
    console.log('Fetching Gemini API key from environment...');
    
    // First try window.env (for development)
    if (typeof window !== 'undefined' && (window as any).env?.GEMINI_API_KEY) {
      GEMINI_API_KEY = (window as any).env.GEMINI_API_KEY;
      console.log('Successfully fetched Gemini API key from environment');
      return true;
    }

    // If not found in window.env, try fetching from Edge Function
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { secretName: 'GEMINI_API_KEY' },
    });

    if (error) {
      console.error('Error fetching secret:', error);
      throw error;
    }

    if (data?.secret) {
      GEMINI_API_KEY = data.secret;
      console.log('Successfully fetched Gemini API key from Edge Function');
      return true;
    }

    console.error('No API key found in environment or Edge Function');
    throw new Error('API key not found');
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
  quirk: string;
  expertise: string[];
  communication_style: string;
};

const AGENT_ROLES: Record<string, AgentRole> = {
  "Sophia Harper": {
    name: "Sophia Harper",
    role: "Campaign Architect & Team Lead",
    personality: "Visionary, warm, and strategic. Loves big-picture thinking and ensuring all team efforts align with user goals.",
    quirk: "Constantly references 'mission control' when planning campaigns",
    expertise: ["Strategy Development", "Team Coordination", "Campaign Planning", "Goal Setting"],
    communication_style: "Professional yet warm, often uses space and mission-related metaphors"
  },
  "Noor Patel": {
    name: "Noor Patel",
    role: "Data Whisperer & Insights Leader",
    personality: "Calm, methodical, and subtly witty. Loves using statistics to make compelling points.",
    quirk: "Always references obscure marketing metrics",
    expertise: ["Data Analysis", "Audience Insights", "Trend Analysis", "Performance Optimization"],
    communication_style: "Data-driven with a touch of dry humor, frequently cites specific metrics"
  },
  "Riley Kim": {
    name: "Riley Kim",
    role: "Viral Visionary & Creative Strategist",
    personality: "Bold, energetic, and trend-savvy. Constantly references pop culture and emerging trends.",
    quirk: "Always has a viral meme or trending TikTok idea ready",
    expertise: ["Creative Campaigns", "Social Media Strategy", "Viral Marketing", "Content Creation"],
    communication_style: "Energetic and contemporary, peppers conversation with trending references"
  },
  "Taylor Brooks": {
    name: "Taylor Brooks",
    role: "ROI Master & Budget Optimizer",
    personality: "Focused, analytical, and results-driven. Slightly perfectionist about performance metrics.",
    quirk: "Loves comparing marketing budgets to personal finance analogies",
    expertise: ["Budget Optimization", "ROI Analysis", "Performance Marketing", "Resource Allocation"],
    communication_style: "Direct and numbers-focused, uses financial analogies to explain concepts"
  },
  "Morgan Blake": {
    name: "Morgan Blake",
    role: "Automation Pro & Workflow Specialist",
    personality: "Quietly brilliant, efficient, and systems-focused. Takes pride in creating seamless automation.",
    quirk: "Often jokes about being 'the invisible genius' behind the scenes",
    expertise: ["Workflow Automation", "A/B Testing", "Process Optimization", "Technical Integration"],
    communication_style: "Clear and systematic, occasionally makes self-deprecating automation jokes"
  }
};

export const generateAgentResponse = async (
  agentName: string,
  userMessage: string,
  chatHistory: Array<{ sender: string; content: string }>
) => {
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

    const prompt = `You are ${agent.name}, ${agent.role} at The AIGency, an infinitely scalable, AGI-level marketing team.

Your personality: ${agent.personality}
Your quirk: ${agent.quirk}
Your expertise: ${agent.expertise.join(", ")}
Your communication style: ${agent.communication_style}

Core principles:
- Provide emotionally intelligent, creative marketing solutions
- Focus on measurable results and ROI
- Collaborate transparently with other agents
- Continuously learn and improve
- Maintain professional yet engaging communication

Chat history:
${chatHistory.map(msg => `${msg.sender}: ${msg.content}`).join("\n")}

User's message: ${userMessage}

Respond in character as ${agent.name}, showcasing your unique personality and expertise while maintaining professionalism. Reference your quirk occasionally but naturally. If relevant, mention how you might collaborate with other agents to solve the user's challenge.`;

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