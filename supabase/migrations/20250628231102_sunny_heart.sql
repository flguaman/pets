/*
  # Create posts table for user publications

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `type` (text, required) - adoption, lost, stolen, disoriented, general
      - `pet_id` (uuid, optional foreign key to pets)
      - `image_url` (text, optional)
      - `location` (text, optional)
      - `contact_info` (text, optional)
      - `reward` (text, optional)
      - `status` (text, default 'active')
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `posts` table
    - Add policy for authenticated users to manage their own posts
    - Add policy for public read access to posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('adoption', 'lost', 'stolen', 'disoriented', 'general')),
  pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  image_url text,
  location text,
  contact_info text,
  reward text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Enable read access for all users" ON posts
  FOR SELECT USING (true);

-- Policy for authenticated users to insert their own posts
CREATE POLICY "Enable insert for authenticated users" ON posts
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own posts
CREATE POLICY "Enable update for users based on user_id" ON posts
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to delete their own posts
CREATE POLICY "Enable delete for users based on user_id" ON posts
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_type_idx ON posts(type);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_pet_id_idx ON posts(pet_id);