-- Shopify connected stores: OAuth access tokens per user
CREATE TABLE IF NOT EXISTS shopify_stores (
  id SERIAL PRIMARY KEY,
  customer_user_id INT NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
  shop TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT shopify_stores_shop_user_unique UNIQUE (shop, customer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_shopify_stores_customer_user ON shopify_stores(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_stores_shop ON shopify_stores(shop);
