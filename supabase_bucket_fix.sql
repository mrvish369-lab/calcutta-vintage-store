-- SQL Script: Create Storage Bucket and Policies

-- 1. Create the 'pdf-assets' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-assets', 'pdf-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure Storage Policies are set for the bucket
-- Note: We use 'DO $$' to avoid errors if policies already exist

DO $$
BEGIN
    -- Public Read Access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'pdf-assets');
    END IF;

    -- Admin Upload Access (Public for now for easy testing)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload Access' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdf-assets');
    END IF;
END $$;
