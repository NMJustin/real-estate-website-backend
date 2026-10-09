import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyManagerOwnership20261008000002 implements MigrationInterface {
  name = 'AddPropertyManagerOwnership20261008000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD COLUMN IF NOT EXISTS "property_manager_id" text
      REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_properties_property_manager_id"
      ON "properties" ("property_manager_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_properties_property_manager_id"');
    await queryRunner.query('ALTER TABLE "properties" DROP COLUMN IF EXISTS "property_manager_id"');
  }
}
