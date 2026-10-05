import { AppDataSource } from './lib/typeorm.js';

async function fixSchema() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Check what columns exist in property_features
    const result = await queryRunner.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'property_features'
      ORDER BY ordinal_position
    `);
    console.log('property_features columns:', result);

    // Check if created_at column exists
    const createdAtExists = result.some((row: any) => row.column_name === 'created_at');

    if (!createdAtExists) {
      await queryRunner.query(`
        ALTER TABLE "property_features"
        ADD COLUMN "created_at" timestamp NOT NULL DEFAULT now()
      `);
      console.log('Added created_at column to property_features');
    } else {
      console.log('created_at column already exists in property_features');
    }
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

fixSchema().catch((error) => {
  console.error('Fix failed:', error);
  process.exit(1);
});
