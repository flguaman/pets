/*
  # Fix RLS policies for pets table

  1. Security Updates
    - Drop existing problematic policies
    - Create new comprehensive RLS policies for pets table
    - Ensure authenticated users can manage their own pets
    - Allow public read access for QR code functionality

  2. Policy Details
    - Public read policy: allows anyone to view pet information (needed for QR codes)
    - Authenticated insert policy: allows authenticated users to create pets with their user_id
    - Authenticated update policy: allows users to update only their own pets
    - Authenticated delete policy: allows users to delete only their own pets
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public can read pets" ON pets;
DROP POLICY IF EXISTS "Users can manage their own pets" ON pets;

-- Ensure RLS is enabled
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (needed for QR code functionality)
CREATE POLICY "Enable read access for all users" ON pets
  FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to insert pets with their own user_id
CREATE POLICY "Enable insert for authenticated users" ON pets
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow authenticated users to update their own pets
CREATE POLICY "Enable update for users based on user_id" ON pets
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow authenticated users to delete their own pets
CREATE POLICY "Enable delete for users based on user_id" ON pets
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);