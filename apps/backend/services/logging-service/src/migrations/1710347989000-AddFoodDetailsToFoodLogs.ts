import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFoodDetailsToFoodLogs1710347989000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foodId column
    await queryRunner.query(`
      ALTER TABLE food_logs
      ADD COLUMN IF NOT EXISTS "foodId" TEXT NULL
    `);

    // Add measureWeight column
    await queryRunner.query(`
      ALTER TABLE food_logs
      ADD COLUMN IF NOT EXISTS "measureWeight" FLOAT NULL
    `);

    // Add index on foodId for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_food_logs_foodId" ON food_logs ("foodId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_food_logs_foodId"
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE food_logs
      DROP COLUMN IF EXISTS "foodId"
    `);

    await queryRunner.query(`
      ALTER TABLE food_logs
      DROP COLUMN IF EXISTS "measureWeight"
    `);
  }
}
