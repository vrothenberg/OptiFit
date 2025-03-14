import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAutocompleteCache1710347987000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create autocomplete_cache table
    await queryRunner.query(`
      CREATE TABLE autocomplete_cache (
        query TEXT PRIMARY KEY,
        suggestions TEXT[] NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        usage_count INTEGER NOT NULL DEFAULT 1
      )
    `);
    
    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_autocomplete_cache_last_used ON autocomplete_cache (last_used);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS autocomplete_cache`);
  }
}
