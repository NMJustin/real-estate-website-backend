import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DeduplicateRoleNames20261007000002 implements MigrationInterface {
  name = 'DeduplicateRoleNames20261007000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH ranked_roles AS (
        SELECT
          id,
          FIRST_VALUE(id) OVER (
            PARTITION BY LOWER(BTRIM(name))
            ORDER BY CASE WHEN name = LOWER(BTRIM(name)) THEN 0 ELSE 1 END, id
          ) AS canonical_id
        FROM roles
      )
      UPDATE users AS account
      SET role_id = ranked_roles.canonical_id
      FROM ranked_roles
      WHERE account.role_id = ranked_roles.id
        AND ranked_roles.id <> ranked_roles.canonical_id
    `);
    await queryRunner.query(`
      WITH ranked_roles AS (
        SELECT
          id,
          FIRST_VALUE(id) OVER (
            PARTITION BY LOWER(BTRIM(name))
            ORDER BY CASE WHEN name = LOWER(BTRIM(name)) THEN 0 ELSE 1 END, id
          ) AS canonical_id
        FROM roles
      )
      DELETE FROM roles
      WHERE id IN (SELECT id FROM ranked_roles WHERE id <> canonical_id)
    `);
    await queryRunner.query(`UPDATE roles SET name = LOWER(BTRIM(name))`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_roles_name_normalized"
      ON roles (LOWER(BTRIM(name)))
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_roles_name_normalized"`);
  }
}
