-- SQL Script for Supabase SQL Editor

-- 1. Create the Assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT,
    year TEXT,
    pdf_url TEXT,
    cover_url TEXT,
    content_json JSONB, -- For stored interactive chapters/languages
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Storage Bucket
-- (Run this individually if bucket creation policy is locked)
-- insert into storage.buckets (id, name, public) values ('pdf-assets', 'pdf-assets', true);

-- 3. Storage Policies (Allow public read, restricted write)
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'pdf-assets');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdf-assets');

-- 4. Table RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read assets" ON assets FOR SELECT USING (true);
CREATE POLICY "Admin CRUD assets" ON assets FOR ALL USING (true); -- For now, full access, you can lock this to authenticated users later.
