import 'reflect-metadata';
import AppDataSource from '../lib/typeorm.js';

try {
  await AppDataSource.initialize();
  const migrations = await AppDataSource.runMigrations();
  console.log(`Applied ${migrations.length} database migration(s).`);
} catch (error) {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
} finally {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}
