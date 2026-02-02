/**
 * Environment-based configuration. No credentials hardcoded.
 * Use DATABASE_URL or individual DB_* vars (for cloud/platform compatibility).
 */
const isProd = process.env.NODE_ENV === "production";

function parseDbUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 5432,
      database: u.pathname?.replace(/^\//, "") || "postgres",
      user: u.username || undefined,
      password: u.password || undefined,
      ssl: isProd && u.hostname !== "localhost" ? { rejectUnauthorized: true } : false,
    };
  } catch {
    return null;
  }
}

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  const dbPassword = process.env.DB_PASSWORD;
  const dbUser = process.env.DB_USER || process.env.DB_USERNAME;

  if (url) {
    const parsed = parseDbUrl(url);
    if (parsed) {
      // DB_PASSWORD overrides URL password (fixes passwords with @ or other special chars in URL)
      if (dbPassword !== undefined && dbPassword !== "") {
        parsed.password = dbPassword;
      }
      if (dbUser) {
        parsed.user = dbUser;
      }
      if (parsed.password !== undefined && parsed.password !== "") {
        return parsed;
      }
    }
  }

  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "5432", 10);
  const database = process.env.DB_NAME || process.env.DB_DATABASE || "elursh";
  const user = dbUser;
  const password = dbPassword;
  if (!user || !password) return null;
  return {
    host,
    port,
    database,
    user,
    password,
    ssl: isProd && host !== "localhost" ? { rejectUnauthorized: true } : false,
  };
}

export const config = {
  env: process.env.NODE_ENV || "development",
  isProd,
  isDev: !isProd,

  api: {
    port: parseInt(process.env.PORT || process.env.API_PORT || "3001", 10),
    baseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || process.env.API_PORT || "3001"}`,
  },

  db: getDbConfig(),

  jwt: {
    secret: process.env.JWT_SECRET || process.env.SESSION_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    issuer: process.env.JWT_ISSUER || "elursh-api",
  },

  cors: {
    origin: process.env.FRONTEND_ORIGIN || (isProd ? false : true),
    credentials: true,
  },

  session: {
    secret: process.env.SESSION_SECRET || "elursh-manager-secret-change-in-production",
  },
};

export default config;
