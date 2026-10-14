import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataRetention20261012000003 implements MigrationInterface {
  name = 'AddDataRetention20261012000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Add retention policy column to site settings
    await queryRunner.query(`
      ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "analytics_retention_days" integer DEFAULT 365
    `);
    
    // Create index for faster cleanup of old analytics data
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_page_views_created_at_cleanup" ON "page_views" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_property_views_created_at_cleanup" ON "property_views" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_click_events_created_at_cleanup" ON "click_events" ("created_at")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_click_events_created_at_cleanup"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_property_views_created_at_cleanup"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_page_views_created_at_cleanup"`);
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_retention_days"`);
  }
}
