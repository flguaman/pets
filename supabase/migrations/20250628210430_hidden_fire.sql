/*
  # Create pets table for pet management system

  1. New Tables
    - `pets`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `owner` (text, required)
      - `phone` (text, required)
      - `address` (text, required)
      - `type` (text, required)
      - `breed` (text, required)
      - `age` (integer, required)
      - `illness` (text, optional)
      - `observations` (text, optional)
      - `image_url` (text, optional)
      - `status` (text, default 'healthy')
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `pets` table
    - Add policy for authenticated users to manage their own pets
    - Add policy for public read access to pets (for QR code scanning)
*/

CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  type text NOT NULL,
  breed text NOT NULL,
  age integer NOT NULL DEFAULT 1,
  illness text DEFAULT '',
  observations text DEFAULT '',
  image_url text DEFAULT 'https://images.unsplash.com/photo-1552053831-71594a27632d',
  status text DEFAULT 'healthy',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their own pets
CREATE POLICY "Users can manage their own pets"
  ON pets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for public read access (for QR code scanning)
CREATE POLICY "Public can read pets"
  ON pets
  FOR SELECT
  TO public
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();