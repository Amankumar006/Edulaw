/*
  # Add chapters table and relationship to modules

  1. New Tables
    - `chapters`
      - `id` (uuid, primary key)
      - `module_id` (uuid, foreign key to modules)
      - `title` (text)
      - `content` (text)
      - `sequence_number` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `chapters` table
    - Add policies for authenticated users to manage chapters
*/

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  sequence_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add updated_at column to modules if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'modules' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE modules ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add published_status column to modules if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'modules' AND column_name = 'published_status'
  ) THEN
    ALTER TABLE modules ADD COLUMN published_status text DEFAULT 'draft' CHECK (published_status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Create policies for chapters
CREATE POLICY "Anyone can view chapters"
  ON chapters
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chapters"
  ON chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chapters"
  ON chapters
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete chapters"
  ON chapters
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();