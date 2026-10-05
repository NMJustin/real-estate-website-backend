import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { databaseConfig, getDatabaseUrl, getDirectDatabaseUrl } from '../config/database.js';
import { TextIdSubscriber } from './TextIdSubscriber.js';

dotenv.config();

const isCompiled = import.meta.url.includes('/dist/');

// Use direct connection with SSL mode parameter
const databaseUrl = getDirectDatabaseUrl();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  synchronize: databaseConfig.synchronize,
  logging: databaseConfig.logging,
  entities: [isCompiled ? 'dist/entities/**/*.js' : 'src/entities/**/*.ts'],
  migrations: [isCompiled ? 'dist/migrations/**/*.js' : 'src/migrations/**/*.ts'],
  subscribers: [TextIdSubscriber],
  // SSL is handled via sslmode parameter in the URL
});

export default AppDataSource;
