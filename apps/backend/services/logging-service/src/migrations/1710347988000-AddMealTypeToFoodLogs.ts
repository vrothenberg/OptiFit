import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMealTypeToFoodLogs1710347988000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE food_logs
      ADD COLUMN meal_type TEXT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE food_logs
      DROP COLUMN meal_type;
    `);
  }
}
