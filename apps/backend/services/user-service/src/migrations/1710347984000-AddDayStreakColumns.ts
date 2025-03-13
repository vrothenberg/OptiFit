import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayStreakColumns1710347984000 implements MigrationInterface {
    name = 'AddDayStreakColumns1710347984000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add current_streak column with default value 0
        await queryRunner.query(`ALTER TABLE "users" ADD "current_streak" integer NOT NULL DEFAULT 0`);
        
        // Add last_active_date column (nullable)
        await queryRunner.query(`ALTER TABLE "users" ADD "last_active_date" date`);
        
        // Add max_streak column with default value 0
        await queryRunner.query(`ALTER TABLE "users" ADD "max_streak" integer NOT NULL DEFAULT 0`);
        
        // Add comment to explain the purpose of these columns
        await queryRunner.query(`COMMENT ON COLUMN "users"."current_streak" IS 'Current consecutive days streak'`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."last_active_date" IS 'Date of last user activity'`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."max_streak" IS 'Maximum streak achieved by the user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the columns in reverse order
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "max_streak"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_active_date"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "current_streak"`);
    }
}
