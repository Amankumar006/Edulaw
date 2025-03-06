/*
  # Create profiles table and related tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `interests` (text array, nullable)
      - `learning_preferences` (jsonb, nullable)
    - `modules`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `category` (text, not null)
      - `difficulty` (text, not null)
      - `estimated_time_minutes` (integer, not null)
      - `content` (jsonb, not null)
      - `image_url` (text, nullable)
      - `created_at` (timestamptz, default now())
    - `challenges`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `points` (integer, not null)
      - `difficulty` (text, not null)
      - `module_id` (uuid, references modules)
      - `questions` (jsonb, not null)
      - `created_at` (timestamptz, default now())
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `module_id` (uuid, references modules)
      - `completed_lessons` (text array, default '{}')
      - `quiz_scores` (jsonb, default '{}')
      - `last_accessed` (timestamptz, default now())
      - `completion_percentage` (integer, default 0)
    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text, not null)
      - `description` (text, not null)
      - `icon` (text, not null)
      - `unlocked` (boolean, default false)
      - `unlocked_at` (timestamptz, nullable)
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `messages` (jsonb, default '[]')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  interests text[],
  learning_preferences jsonb
);

-- Create modules table for learning content
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time_minutes integer NOT NULL,
  content jsonb NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create challenges table for quizzes and interactive content
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  module_id uuid REFERENCES modules ON DELETE CASCADE,
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table to track learning progress
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  module_id uuid REFERENCES modules ON DELETE CASCADE,
  completed_lessons text[] DEFAULT '{}',
  quiz_scores jsonb DEFAULT '{}',
  last_accessed timestamptz DEFAULT now(),
  completion_percentage integer DEFAULT 0,
  UNIQUE(user_id, module_id)
);

-- Create achievements table for gamification
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  unlocked boolean DEFAULT false,
  unlocked_at timestamptz
);

-- Create chat_history table for AI assistant conversations
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for modules (public read access)
CREATE POLICY "Anyone can view modules"
  ON modules
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for challenges (public read access)
CREATE POLICY "Anyone can view challenges"
  ON challenges
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for achievements
CREATE POLICY "Users can view their own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for chat_history
CREATE POLICY "Users can view their own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat history"
  ON chat_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a trigger to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();