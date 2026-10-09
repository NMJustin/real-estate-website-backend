import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetFields20261007000001 implements MigrationInterface {
  name = 'AddPasswordResetFields20261007000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token_hash" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires_at" timestamp`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "password_reset_expires_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "password_reset_token_hash"`);
  }
}
