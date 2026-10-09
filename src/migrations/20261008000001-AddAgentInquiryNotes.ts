import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgentInquiryNotes20261008000001 implements MigrationInterface {
  name = 'AddAgentInquiryNotes20261008000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agent_inquiry_notes" (
        "id" text PRIMARY KEY,
        "agent_id" text NOT NULL REFERENCES "agents"("id") ON DELETE CASCADE,
        "inquiry_id" text NOT NULL REFERENCES "inquiries"("id") ON DELETE CASCADE,
        "notes" text NOT NULL DEFAULT '',
        "next_follow_up_date" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "uq_agent_inquiry_notes_agent_inquiry" UNIQUE ("agent_id", "inquiry_id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "agent_inquiry_notes"');
  }
}
