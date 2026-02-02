-- Initial schema: UTF-8 assumed (set at DB creation in pgAdmin).
-- All tables use created_at/updated_at where applicable; FKs and indexes for scale.

-- Users (JWT auth, role-based access)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Analysed stores (from store audit flow)
CREATE TABLE IF NOT EXISTS analysed_stores (
  id SERIAL PRIMARY KEY,
  store_url TEXT NOT NULL,
  analysed_at TIMESTAMPTZ DEFAULT NOW(),
  result_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysed_stores_store_url ON analysed_stores(store_url);
CREATE INDEX IF NOT EXISTS idx_analysed_stores_analysed_at ON analysed_stores(analysed_at DESC);

-- Contacts (contact form submissions)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  store_link TEXT,
  message TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Services (Improve Store; full CRUD from admin)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  store_stages JSONB DEFAULT '[]',
  description TEXT,
  pain_points JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  delivery_days_min INT DEFAULT 5,
  delivery_days_max INT DEFAULT 10,
  rating NUMERIC(3,1) DEFAULT 4.5,
  users INT DEFAULT 500,
  packages JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order, id);

-- Store reports (custom audit result per store)
CREATE TABLE IF NOT EXISTS store_reports (
  id SERIAL PRIMARY KEY,
  store_url TEXT NOT NULL UNIQUE,
  report_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_reports_store_url ON store_reports(store_url);

-- Orders (Improve Store orders)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  store_link TEXT,
  collaborator_code TEXT,
  service_id INT REFERENCES services(id) ON DELETE SET NULL,
  service_title TEXT,
  package_name TEXT,
  package_price_usd NUMERIC(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- Payments (Paystack and others)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE,
  email TEXT,
  amount_kobo BIGINT,
  amount_usd NUMERIC(10,2),
  metadata_json JSONB,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);

-- Emails sent (manager-sent email log)
CREATE TABLE IF NOT EXISTS emails_sent (
  id SERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emails_sent_sent_at ON emails_sent(sent_at DESC);

-- Content pages (CMS-style; for /api/v1/content-pages)
CREATE TABLE IF NOT EXISTS content_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  meta_title TEXT,
  meta_description TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_published ON content_pages(published);

-- Products (catalog for /api/v1/products; minimal schema)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_usd NUMERIC(10,2),
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order, id);
