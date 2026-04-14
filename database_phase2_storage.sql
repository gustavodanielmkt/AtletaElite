-- Phase 2: Exercise Media Storage
-- Run this SQL in the Supabase SQL Editor

-- 1. Create the exercise-media bucket (public, 50MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-media',
  'exercise-media',
  true,
  52428800,
  ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload to their own folder (physio_id/filename)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Physio upload exercise media'
  ) THEN
    CREATE POLICY "Physio upload exercise media"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'exercise-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- 3. Public read for everyone
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read exercise media'
  ) THEN
    CREATE POLICY "Public read exercise media"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'exercise-media');
  END IF;
END $$;

-- 4. Allow physio to delete their own files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Physio delete exercise media'
  ) THEN
    CREATE POLICY "Physio delete exercise media"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'exercise-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Verify
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'exercise-media';
