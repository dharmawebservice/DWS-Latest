-- ================================================================
-- DWS MONSTER — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ================================================================

-- BRANDS table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  service_type TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending | partial | paid | cancelled
  payment_method TEXT,
  invoice_number TEXT UNIQUE,
  notes TEXT,
  project_url TEXT,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES (contact form submissions)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- unread | read | replied
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEWSLETTER emails
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY — public can only read active brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands_public_read" ON brands FOR SELECT USING (active = true);

-- Transactions, messages, newsletter — no public access (service role only)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at on transactions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sample brands (your existing ones)
INSERT INTO brands (name, logo_url, website_url, display_order) VALUES
  ('Subio Foods', '/brands/Subio.webp', 'https://subiofoods.com', 1),
  ('CraveCart', '/brands/cravecart.webp', 'https://crave-cart-82wd.onrender.com', 2),
  ('Diyami Productions', '/brands/diyami.webp', 'https://diyamiproductions.com', 3),
  ('AC5 Construction', '/brands/ac5.webp', 'https://www.ac5construction.co.uk', 4);


-- ================================================================
-- Packages, testimonials, onboarding, work details
-- (same as supabase-migration.sql — idempotent; existing installs can
-- run supabase-migration.sql instead)
-- ================================================================
-- ---- BRANDS: work / case-study fields ----
ALTER TABLE brands ADD COLUMN IF NOT EXISTS category   TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS summary    TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS result     TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS case_study TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS image_url  TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS tags       TEXT;  -- comma separated
ALTER TABLE brands ADD COLUMN IF NOT EXISTS featured   BOOLEAN DEFAULT false;

-- ---- MESSAGES: service picked in the contact form + private notes ----
ALTER TABLE messages ADD COLUMN IF NOT EXISTS service TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS notes   TEXT;

-- ---- PACKAGES (pricing cards on the public site) ----
CREATE TABLE IF NOT EXISTS packages (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  price          NUMERIC NOT NULL,
  original_price NUMERIC,
  badge          TEXT,
  description    TEXT,
  features       TEXT[] DEFAULT '{}',
  cta            TEXT DEFAULT 'Get started',
  popular        BOOLEAN DEFAULT false,
  service_label  TEXT,
  display_order  INTEGER DEFAULT 0,
  active         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ---- TESTIMONIALS (no seed rows: add real ones in the Vault) ----
CREATE TABLE IF NOT EXISTS testimonials (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT,
  text          TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ONBOARDING links for new clients ----
CREATE TABLE IF NOT EXISTS onboarding (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token        TEXT UNIQUE NOT NULL,
  client_name  TEXT NOT NULL,
  client_email TEXT,
  package_name TEXT,
  status       TEXT DEFAULT 'pending', -- pending | submitted
  answers      JSONB,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- ---- Row Level Security: no public policies (server uses the service role) ----
ALTER TABLE packages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding   ENABLE ROW LEVEL SECURITY;

-- ---- Seed the three packages ONLY if the table is empty ----
INSERT INTO packages (name, price, original_price, badge, description, features, cta, popular, service_label, display_order)
SELECT * FROM (VALUES
  ('Starter', 2499::numeric, 2999::numeric, '₹500 off', 'Perfect for small businesses and landing pages.',
   ARRAY['1–3 pages','Mobile responsive','Contact form','Basic SEO setup','Free Vercel hosting','1-week delivery'],
   'Get started', false, 'Landing Page (Starter — ₹2499)', 1),
  ('Pro', 5999::numeric, NULL::numeric, 'Most popular', 'For businesses that need a powerful online presence.',
   ARRAY['Up to 6 pages','Premium animations','WhatsApp integration','Advanced SEO','Priority support','Unlimited revisions','Google Analytics'],
   'Get Pro', true, 'Business Website (Pro — ₹5999)', 2),
  ('Business', 9999::numeric, NULL::numeric, NULL, 'Full-stack solution with backend & admin panel.',
   ARRAY['Unlimited pages','Custom admin panel','Database & backend','Payment integration','Performance optimization','1-month free support','Full source code'],
   'Go Business', false, 'Full-Stack App (Business — ₹9999)', 3)
) AS v(name, price, original_price, badge, description, features, cta, popular, service_label, display_order)
WHERE NOT EXISTS (SELECT 1 FROM packages);

-- ---- DOCUMENTS: saved client/project details used by the Vault "Documents" tab ----
CREATE TABLE IF NOT EXISTS doc_projects (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name  TEXT NOT NULL,
  project_name TEXT,
  data         JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE doc_projects ENABLE ROW LEVEL SECURITY;


-- Allow the server (service_role) to use every table. Newer Supabase projects
-- no longer grant this automatically, which causes "permission denied for table".
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
