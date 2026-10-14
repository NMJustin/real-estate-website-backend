import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameInquiryMessageColumn20261012000001 implements MigrationInterface {
  name = 'RenameInquiryMessageColumn20261012000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inquiries"
      RENAME COLUMN "message" TO "inquiry"
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inquiries"
      RENAME COLUMN "inquiry" TO "message"
    `);
  }
}
