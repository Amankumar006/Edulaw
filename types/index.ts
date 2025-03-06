export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  interests?: string[];
  learning_preferences?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    daily_goal_minutes: number;
    notification_enabled: boolean;
  };
}

export interface LegalModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time_minutes: number;
  completion_percentage: number;
  image_url: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  module_id: string;
}

export interface LegalQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  module_id: string;
}

export interface UserProgress {
  user_id: string;
  module_id: string;
  completed_lessons: string[];
  quiz_scores: Record<string, number>;
  last_accessed: string;
  completion_percentage: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date | string;
  category?: string;
  bookmarked?: boolean;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}