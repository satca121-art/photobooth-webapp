/*
  # Create Photos Table for Admin Management

  1. New Tables
    - `photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `file_path` (text) - Storage path for the photo file
      - `file_name` (text) - Original filename
      - `uploaded_at` (timestamptz) - Timestamp when photo was uploaded
      - `file_size` (integer) - Size of the photo file in bytes
      - `download_count` (integer) - Number of times photo was downloaded by admin
      
  2. Security
    - Enable RLS on `photos` table
    - Add policy for public users to insert photos (from photobooth)
    - Add policy for admin viewing (no auth required for simplicity)
    
  3. Storage
    - Create public bucket for photo storage
*/

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  file_size integer DEFAULT 0,
  download_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert photos (from photobooth)
CREATE POLICY "Anyone can upload photos"
  ON photos
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to view photos (for admin page)
CREATE POLICY "Anyone can view photos"
  ON photos
  FOR SELECT
  TO anon
  USING (true);

-- Allow anyone to update download count
CREATE POLICY "Anyone can update download count"
  ON photos
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photobooth-photos', 'photobooth-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public access
CREATE POLICY "Anyone can upload photos to bucket"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'photobooth-photos');

CREATE POLICY "Anyone can view photos in bucket"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'photobooth-photos');
