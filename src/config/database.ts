import { env } from './env.js';

const defaultUsername = process.env.DB_USERNAME || '';
const defaultPassword = process.env.DB_PASSWORD || '';
const defaultDatabase = process.env.DB_NAME || '';

export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: defaultUsername,
  password: defaultPassword,
  database: defaultDatabase,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

export const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const { host, port, username, password, database } = databaseConfig;

  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
};

export const getDirectDatabaseUrl = () => {
  // Use direct (non-pooled) connection for migrations
  if (process.env.DATABASE_URL_UNPOOLED) {
    return process.env.DATABASE_URL_UNPOOLED;
  }

  // If only pooled URL is available, convert it to direct URL
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    // Remove -pooler suffix from hostname to get direct connection
    // Handle both -pooler. and pooler. patterns
    let directUrl = url.replace(/-pooler\./g, '.').replace(/pooler\./g, '.');

    // Add SSL mode parameter if not present
    if (!directUrl.includes('sslmode')) {
      const separator = directUrl.includes('?') ? '&' : '?';
      directUrl += `${separator}sslmode=no-verify`;
    }

    return directUrl;
  }

  const { host, port, username, password, database } = databaseConfig;

  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
};

export default databaseConfig;
