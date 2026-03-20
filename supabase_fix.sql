-- SQL Fix Script: Ensure all columns exist in 'assets' table

DO $$
BEGIN
    -- Add columns if they are missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets' AND column_name='author') THEN
        ALTER TABLE assets ADD COLUMN author TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets' AND column_name='year') THEN
        ALTER TABLE assets ADD COLUMN year TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets' AND column_name='pdf_url') THEN
        ALTER TABLE assets ADD COLUMN pdf_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets' AND column_name='content_json') THEN
        ALTER TABLE assets ADD COLUMN content_json JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets' AND column_name='cover_url') THEN
        ALTER TABLE assets ADD COLUMN cover_url TEXT;
    END IF;
END $$;
