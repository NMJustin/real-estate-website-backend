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
  synchronize: env.nodeEnv !== 'production',
  logging: env.nodeEnv === 'development',
};

export const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const { host, port, username, password, database } = databaseConfig;

  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
};

export default databaseConfig;
