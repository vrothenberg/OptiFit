import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFoodCacheTables1710347985000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create food_cache table
    await queryRunner.query(`
      CREATE TABLE food_cache (
        food_id TEXT PRIMARY KEY,
        food_name TEXT NOT NULL,
        known_as TEXT,
        category TEXT,
        category_label TEXT,
        image_url TEXT,
        nutrients JSONB NOT NULL,
        measures JSONB NOT NULL,
        full_details JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_used TIMESTAMPTZ,
        usage_count INTEGER NOT NULL DEFAULT 1
      )
    `);
    
    // Create search_term_cache table
    await queryRunner.query(`
      CREATE TABLE search_term_cache (
        search_term TEXT PRIMARY KEY,
        food_ids TEXT[] NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_used TIMESTAMPTZ,
        usage_count INTEGER NOT NULL DEFAULT 1
      )
    `);
    
    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_food_cache_food_name ON food_cache (food_name);
      CREATE INDEX idx_search_term_cache_last_used ON search_term_cache (last_used);
      CREATE INDEX idx_food_cache_last_used ON food_cache (last_used);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS search_term_cache`);
    await queryRunner.query(`DROP TABLE IF EXISTS food_cache`);
  }
}
