/**
 * Shopify API integration for dashboard data.
 * Docs: https://shopify.dev/docs/api
 *
 * Required setup:
 * - Shopify Partner app with OAuth
 * - Store access token from OAuth flow
 * - GraphQL Admin API for orders, analytics, products
 *
 * Key APIs:
 * - Orders: GraphQL Admin API - orders query for revenue
 * - Conversion: Calculate from sessions + orders (may need Analytics API or custom)
 * - Store audit/reports: Custom logic + Storefront/Admin API for store data
 */

const SHOPIFY_GRAPHQL = "/api/shopify/graphql"; // Proxy to backend

export async function fetchShopifyData(storeAccessToken, query, variables = {}) {
  const res = await fetch(SHOPIFY_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": storeAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error("Shopify API error");
  return res.json();
}

/** Example: fetch orders for revenue (GraphQL Admin API) */
export const ORDERS_QUERY = `
  query getOrders($first: Int!) {
    orders(first: $first, query: "created_at:>=2026-01-01") {
      edges {
        node {
          totalPriceSet { shopMoney { amount } }
          createdAt
        }
      }
    }
  }
`;
