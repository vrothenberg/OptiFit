import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergeUserProfileIntoUser1710347983000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add profile fields to users table
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
      ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2),
      ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6,2),
      ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS dietary_preferences JSONB,
      ADD COLUMN IF NOT EXISTS exercise_preferences JSONB,
      ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
      ADD COLUMN IF NOT EXISTS supplements JSONB,
      ADD COLUMN IF NOT EXISTS sleep_patterns JSONB,
      ADD COLUMN IF NOT EXISTS stress_level INTEGER,
      ADD COLUMN IF NOT EXISTS nutrition_info JSONB,
      ADD COLUMN IF NOT EXISTS location JSONB,
      ADD COLUMN IF NOT EXISTS additional_info JSONB
    `);

    // 2. Copy data from user_profiles to users
    await queryRunner.query(`
      UPDATE users u
      SET 
        date_of_birth = up.date_of_birth,
        gender = up.gender,
        height_cm = up.height_cm,
        weight_kg = up.weight_kg,
        activity_level = up.activity_level,
        dietary_preferences = up.dietary_preferences,
        exercise_preferences = up.exercise_preferences,
        medical_conditions = up.medical_conditions,
        supplements = up.supplements,
        sleep_patterns = up.sleep_patterns,
        stress_level = up.stress_level,
        nutrition_info = up.nutrition_info,
        location = up.location,
        additional_info = up.additional_info
      FROM user_profiles up
      WHERE u.id = up.user_id
    `);

    // 3. Drop the user_profiles table
    await queryRunner.query(`DROP TABLE IF EXISTS user_profiles`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recreate user_profiles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        date_of_birth DATE,
        gender VARCHAR(20),
        height_cm NUMERIC(5,2),
        weight_kg NUMERIC(6,2),
        activity_level VARCHAR(50),
        dietary_preferences JSONB,
        exercise_preferences JSONB,
        medical_conditions TEXT[],
        supplements JSONB,
        sleep_patterns JSONB,
        stress_level INTEGER,
        nutrition_info JSONB,
        location JSONB,
        additional_info JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // 2. Copy data from users to user_profiles
    await queryRunner.query(`
      INSERT INTO user_profiles (
        user_id, date_of_birth, gender, height_cm, weight_kg, activity_level,
        dietary_preferences, exercise_preferences, medical_conditions, supplements,
        sleep_patterns, stress_level, nutrition_info, location, additional_info
      )
      SELECT 
        id, date_of_birth, gender, height_cm, weight_kg, activity_level,
        dietary_preferences, exercise_preferences, medical_conditions, supplements,
        sleep_patterns, stress_level, nutrition_info, location, additional_info
      FROM users
      WHERE 
        date_of_birth IS NOT NULL OR
        gender IS NOT NULL OR
        height_cm IS NOT NULL OR
        weight_kg IS NOT NULL OR
        activity_level IS NOT NULL OR
        dietary_preferences IS NOT NULL OR
        exercise_preferences IS NOT NULL OR
        medical_conditions IS NOT NULL OR
        supplements IS NOT NULL OR
        sleep_patterns IS NOT NULL OR
        stress_level IS NOT NULL OR
        nutrition_info IS NOT NULL OR
        location IS NOT NULL OR
        additional_info IS NOT NULL
    `);

    // 3. Drop the profile columns from users table
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS date_of_birth,
      DROP COLUMN IF EXISTS gender,
      DROP COLUMN IF EXISTS height_cm,
      DROP COLUMN IF EXISTS weight_kg,
      DROP COLUMN IF EXISTS activity_level,
      DROP COLUMN IF EXISTS dietary_preferences,
      DROP COLUMN IF EXISTS exercise_preferences,
      DROP COLUMN IF EXISTS medical_conditions,
      DROP COLUMN IF EXISTS supplements,
      DROP COLUMN IF EXISTS sleep_patterns,
      DROP COLUMN IF EXISTS stress_level,
      DROP COLUMN IF EXISTS nutrition_info,
      DROP COLUMN IF EXISTS location,
      DROP COLUMN IF EXISTS additional_info
    `);
  }
}
