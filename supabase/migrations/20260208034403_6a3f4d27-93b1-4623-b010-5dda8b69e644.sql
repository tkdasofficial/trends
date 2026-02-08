
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Allow anyone to view profile images (public bucket)
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow authenticated uploads (no auth system in Supabase, using anon key)
CREATE POLICY "Anyone can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

-- Allow updates
CREATE POLICY "Anyone can update profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images');

-- Allow deletes
CREATE POLICY "Anyone can delete profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');
