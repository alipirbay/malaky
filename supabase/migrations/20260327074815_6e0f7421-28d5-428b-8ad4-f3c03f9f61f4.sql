
-- Create avatars storage bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Allow anyone to upload (no auth required - app has no auth)
CREATE POLICY "Anyone can upload avatars" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to read avatars
CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

-- Allow anyone to update their avatar
CREATE POLICY "Anyone can update avatars" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'avatars');

-- Allow anyone to delete avatars  
CREATE POLICY "Anyone can delete avatars" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'avatars');
