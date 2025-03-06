import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API with the API key from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Rate limiting variables
let requestCount = 0;
let lastRequestTime = Date.now();
const MAX_REQUESTS_PER_MINUTE = 30;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

// Configure the model
const modelConfig = {
  model: 'gemini-pro',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024,
  },
};

// System prompt for the constitutional law assistant
const SYSTEM_PROMPT = `
You are a specialized AI assistant focused exclusively on Indian Constitutional law. Your purpose is to provide accurate, helpful information about the Indian Constitution, legal principles, and related topics.

Guidelines:
1. Only answer questions related to Indian Constitutional law, the judiciary system, legal principles, and related topics.
2. If a question is outside your scope, politely redirect the conversation to constitutional topics.
3. Provide citations to specific Articles, Sections, Amendments, or landmark cases when relevant.
4. Explain legal terminology in simple, accessible language.
5. Structure complex answers with bullet points or numbered lists for clarity.
6. Keep responses concise (under 300 words) but comprehensive.
7. When uncertain, acknowledge limitations rather than providing potentially incorrect information.
8. Maintain a formal, professional tone appropriate for legal discussions.

Your responses should be accurate, educational, and helpful for users seeking to understand Indian Constitutional law.
`;

// Create a chat session with history management
export class ConstitutionalLawChat {
  private history: { role: 'user' | 'model'; parts: string }[] = [];
  private model;
  private chat;

  constructor() {
    // Validate API key
    if (!API_KEY) {
      console.warn('Gemini API key is missing. Please check your environment variables.');
    }
    
    try {
      // Initialize the model and chat
      this.model = genAI.getGenerativeModel(modelConfig);
      this.chat = this.model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1024,
        },
      });
      
      // Initialize with system prompt
      this.history.push({ role: 'model', parts: SYSTEM_PROMPT });
    } catch (error) {
      console.error('Error initializing Gemini API:', error);
    }
  }

  // Check if we're within rate limits
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if we're in a new time window
    if (now - lastRequestTime > RATE_LIMIT_WINDOW_MS) {
      requestCount = 0;
      lastRequestTime = now;
    }
    
    // Check if we've exceeded the rate limit
    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    // Increment the counter
    requestCount++;
    return true;
  }

  // Send a message to the Gemini API
  async sendMessage(message: string): Promise<{ text: string; error?: string }> {
    // Check if API key is missing
    if (!API_KEY) {
      return { 
        text: '', 
        error: 'API key is missing. Please check your environment configuration.' 
      };
    }
    
    try {
      // Check rate limiting
      if (!this.checkRateLimit()) {
        return { 
          text: '', 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        };
      }

      // Add user message to history (keep only last 5 exchanges = 10 messages)
      this.history.push({ role: 'user', parts: message });
      if (this.history.length > 11) { // 1 system prompt + 10 messages (5 exchanges)
        this.history = [this.history[0], ...this.history.slice(-10)];
      }

      // Set timeout for the request
      const timeoutPromise = new Promise<{ text: string; error: string }>((resolve) => {
        setTimeout(() => {
          resolve({ 
            text: '', 
            error: 'Request timed out. Please try again.' 
          });
        }, 15000); // 15 seconds timeout
      });

      // Make the API request
      const responsePromise = this.chat.sendMessage(message).then(result => {
        const response = result.response;
        const text = response.text();
        
        // Add model response to history
        this.history.push({ role: 'model', parts: text });
        
        return { text };
      });

      // Race between the API request and the timeout
      const result = await Promise.race([responsePromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Error in Gemini API:', error);
      
      // Provide a more detailed error message
      let errorMessage = 'An error occurred while processing your request.';
      
      if (error instanceof Error) {
        // Check for common error types
        if (error.message.includes('429')) {
          errorMessage = 'The API rate limit has been exceeded. Please try again later.';
        } else if (error.message.includes('403')) {
          errorMessage = 'API key authentication failed. Please check your API key.';
        } else if (error.message.includes('400')) {
          errorMessage = 'The request was invalid. Please try a different question.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }
      
      return { 
        text: '', 
        error: `${errorMessage} Please try again.` 
      };
    }
  }

  // Get conversation history
  getHistory() {
    // Skip the system prompt when returning history
    return this.history.slice(1);
  }

  // Reset the conversation
  resetConversation() {
    try {
      this.history = [this.history[0]]; // Keep only the system prompt
      this.chat = this.model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1024,
        },
      });
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  }
}

// Create a singleton instance
export const constitutionalLawChat = new ConstitutionalLawChat();

// Helper function to format responses
export function formatLegalResponse(text: string): string {
  // Bold legal terms
  const legalTerms = [
    'Article', 'Section', 'Amendment', 'Constitution', 'Supreme Court',
    'High Court', 'Fundamental Rights', 'Directive Principles',
    'Writ', 'Habeas Corpus', 'Mandamus', 'Certiorari', 'Prohibition', 'Quo Warranto'
  ];
  
  let formattedText = text;
  
  // Bold legal terms
  legalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    formattedText = formattedText.replace(regex, `**$&**`);
  });
  
  // Format article citations
  formattedText = formattedText.replace(/\b(Article\s+\d+[A-Z]?(\(\d+\))?)/gi, '**$1**');
  
  // Format case citations
  formattedText = formattedText.replace(/\b([A-Za-z]+\s+v\.?\s+[A-Za-z]+)/g, '*$1*');
  
  return formattedText;
}

// Categorize the question
export function categorizeQuestion(question: string): string {
  const categories = {
    'Fundamental Rights': [
      'right', 'freedom', 'equality', 'discrimination', 'article 14', 'article 15',
      'article 16', 'article 17', 'article 18', 'article 19', 'article 20', 'article 21',
      'article 22', 'article 23', 'article 24', 'article 25', 'article 26', 'article 27',
      'article 28', 'article 29', 'article 30', 'article 31', 'article 32'
    ],
    'Directive Principles': [
      'directive', 'principle', 'policy', 'article 36', 'article 37', 'article 38',
      'article 39', 'article 40', 'article 41', 'article 42', 'article 43', 'article 44',
      'article 45', 'article 46', 'article 47', 'article 48', 'article 49', 'article 50',
      'article 51'
    ],
    'Judiciary': [
      'court', 'judge', 'judicial', 'supreme', 'high', 'district', 'tribunal',
      'article 124', 'article 125', 'article 126', 'article 127', 'article 128',
      'article 129', 'article 130', 'article 131', 'article 132', 'article 133',
      'article 134', 'article 135', 'article 136', 'article 137', 'article 138',
      'article 139', 'article 140', 'article 141', 'article 142', 'article 143',
      'article 144', 'article 145', 'article 146', 'article 147'
    ],
    'Legislature': [
      'parliament', 'lok sabha', 'rajya sabha', 'bill', 'act', 'legislation',
      'article 79', 'article 80', 'article 81', 'article 82', 'article 83',
      'article 84', 'article 85', 'article 86', 'article 87', 'article 88',
      'article 89', 'article 90', 'article 91', 'article 92', 'article 93',
      'article 94', 'article 95', 'article 96', 'article 97', 'article 98',
      'article 99', 'article 100'
    ],
    'Executive': [
      'president', 'prime minister', 'cabinet', 'council of ministers', 'governor',
      'article 52', 'article 53', 'article 54', 'article 55', 'article 56',
      'article 57', 'article 58', 'article 59', 'article 60', 'article 61',
      'article 62', 'article 63', 'article 64', 'article 65', 'article 66',
      'article 67', 'article 68', 'article 69', 'article 70', 'article 71',
      'article 72', 'article 73', 'article 74', 'article 75'
    ],
    'Constitutional History': [
      'history', 'constituent assembly', 'drafting', 'adoption', 'amendment',
      'preamble', 'objective resolution'
    ]
  };
  
  const lowerQuestion = question.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'General Constitutional Law';
}