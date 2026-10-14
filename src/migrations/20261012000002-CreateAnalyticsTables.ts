import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsTables20261012000002 implements MigrationInterface {
  name = 'CreateAnalyticsTables20261012000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Create page_views table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "page_views" (
        "id" text PRIMARY KEY,
        "user_id" text,
        "session_id" text,
        "page_path" text NOT NULL,
        "page_title" text,
        "referrer" text,
        "utm_source" text,
        "utm_medium" text,
        "utm_campaign" text,
        "utm_term" text,
        "utm_content" text,
        "device_type" text,
        "browser" text,
        "os" text,
        "ip_address" text,
        "country" text,
        "city" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_page_views_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_page_views_user_id" ON "page_views" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_page_views_page_path" ON "page_views" ("page_path")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_page_views_created_at" ON "page_views" ("created_at")`);

    // Create property_views table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "property_views" (
        "id" text PRIMARY KEY,
        "user_id" text,
        "session_id" text,
        "property_id" text NOT NULL,
        "session_duration_seconds" text,
        "referrer" text,
        "device_type" text,
        "ip_address" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_property_views_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_property_views_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_property_views_user_id" ON "property_views" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_property_views_property_id" ON "property_views" ("property_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_property_views_created_at" ON "property_views" ("created_at")`);

    // Create click_events table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "click_events" (
        "id" text PRIMARY KEY,
        "user_id" text,
        "session_id" text,
        "event_type" text NOT NULL,
        "property_id" text,
        "element_id" text,
        "element_text" text,
        "page_path" text NOT NULL,
        "destination_url" text,
        "device_type" text,
        "ip_address" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_click_events_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_click_events_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_click_events_user_id" ON "click_events" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_click_events_event_type" ON "click_events" ("event_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_click_events_property_id" ON "click_events" ("property_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_click_events_created_at" ON "click_events" ("created_at")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_click_events_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_click_events_property_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_click_events_event_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_click_events_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "click_events"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_property_views_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_property_views_property_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_property_views_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "property_views"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_page_views_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_page_views_page_path"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_page_views_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "page_views"`);
  }
}
