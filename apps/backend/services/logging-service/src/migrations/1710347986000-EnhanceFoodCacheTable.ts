import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceFoodCacheTable1710347986000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to food_cache table
    await queryRunner.query(`
      ALTER TABLE food_cache
      ADD COLUMN brand TEXT,
      ADD COLUMN food_contents_label TEXT,
      ADD COLUMN serving_sizes JSONB,
      ADD COLUMN health_labels TEXT[],
      ADD COLUMN diet_labels TEXT[],
      ADD COLUMN has_full_details BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN upc TEXT,
      ADD COLUMN qualifiers JSONB,
      ADD COLUMN last_api_update TIMESTAMPTZ
    `);
    
    // Create indexes for new columns
    await queryRunner.query(`
      CREATE INDEX idx_food_cache_brand ON food_cache (brand);
      CREATE INDEX idx_food_cache_has_full_details ON food_cache (has_full_details);
      CREATE INDEX idx_food_cache_upc ON food_cache (upc);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_food_cache_brand;
      DROP INDEX IF EXISTS idx_food_cache_has_full_details;
      DROP INDEX IF EXISTS idx_food_cache_upc;
    `);
    
    // Drop columns
    await queryRunner.query(`
      ALTER TABLE food_cache
      DROP COLUMN IF EXISTS brand,
      DROP COLUMN IF EXISTS food_contents_label,
      DROP COLUMN IF EXISTS serving_sizes,
      DROP COLUMN IF EXISTS health_labels,
      DROP COLUMN IF EXISTS diet_labels,
      DROP COLUMN IF EXISTS has_full_details,
      DROP COLUMN IF EXISTS upc,
      DROP COLUMN IF EXISTS qualifiers,
      DROP COLUMN IF EXISTS last_api_update
    `);
  }
}
