// Simple API utilities for our admin panel
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Mock hero data for fallback
const mockHeroData = {
  title: "Transform Your Customer Communication with AI",
  subtitle: "Powerful chatbot automation that scales your business and delights your customers across WhatsApp, SMS, and more.",
  primaryCTA: {
    text: "Start Free Trial",
    href: "/signup"
  },
  secondaryCTA: {
    text: "Watch Demo",
    href: "/demo"
  },
  stats: [
    { value: "99.9%", label: "Uptime" },
    { value: "50+", label: "Integrations" },
    { value: "12", label: "Languages" },
    { value: "24/7", label: "Support" }
  ]
};

// Mock features data
const mockFeatures = [
  {
    id: 1,
    title: "AI-Powered Conversations",
    description: "Advanced natural language processing for human-like interactions",
    category: "ai",
    benefits: ["Natural language understanding", "Context awareness", "Multi-language support"]
  },
  {
    id: 2,
    title: "Multi-Channel Integration",
    description: "Connect WhatsApp, SMS, Telegram, Email, and more from one platform",
    category: "integration",
    benefits: ["WhatsApp Business API", "SMS integration", "Email automation"]
  },
  {
    id: 3,
    title: "Automation Workflows",
    description: "Create sophisticated conversation flows with visual builder tools",
    category: "automation",
    benefits: ["Visual flow builder", "Conditional logic", "Custom integrations"]
  },
  {
    id: 4,
    title: "Real-time Analytics",
    description: "Track performance, measure satisfaction, and optimize conversations",
    category: "analytics",
    benefits: ["Live dashboards", "Custom reports", "Performance insights"]
  },
  {
    id: 5,
    title: "Enterprise Security",
    description: "Bank-grade security with compliance for GDPR, HIPAA, and SOC2",
    category: "security",
    benefits: ["End-to-end encryption", "Compliance ready", "Access controls"]
  },
  {
    id: 6,
    title: "24/7 Human Handoff",
    description: "Seamlessly transfer complex queries to human agents when needed",
    category: "support",
    benefits: ["Smart escalation", "Agent dashboard", "Conversation history"]
  }
];

// Simple API client for our admin panel
export const apiClient = {
  // Get homepage data with fallbacks
  getHomepageData: async () => {
    return {
      hero: mockHeroData,
      features: mockFeatures,
    };
  }
};

// Helper function for API calls
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage = 'Failed to fetch data'
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
}

// Get homepage data with comprehensive fallbacks
export async function getHomepageData() {
  return {
    hero: mockHeroData,
    features: mockFeatures,
  };
} 