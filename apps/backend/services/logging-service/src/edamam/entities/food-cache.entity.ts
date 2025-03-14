import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('food_cache')
export class FoodCache {
  @PrimaryColumn('text')
  foodId: string;
  
  @Column('text')
  foodName: string;
  
  @Column('text', { nullable: true })
  knownAs: string;
  
  @Column('text', { nullable: true })
  category: string;
  
  @Column('text', { nullable: true })
  categoryLabel: string;
  
  @Column('text', { nullable: true })
  imageUrl: string;
  
  @Column('jsonb')
  nutrients: Record<string, number>;
  
  @Column('jsonb')
  measures: any[];
  
  @Column('jsonb', { nullable: true })
  fullDetails: any;
  
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  
  @Column('timestamptz', { nullable: true })
  lastUsed: Date;
  
  @Column('int', { default: 1 })
  usageCount: number;

  // New fields based on Edamam API documentation
  
  @Column('text', { nullable: true })
  brand: string;
  
  @Column('text', { nullable: true })
  foodContentsLabel: string;
  
  @Column('jsonb', { nullable: true })
  servingSizes: any[];
  
  @Column('text', { array: true, nullable: true })
  healthLabels: string[];
  
  @Column('text', { array: true, nullable: true })
  dietLabels: string[];
  
  // Additional fields that might be useful
  
  @Column('boolean', { default: false })
  hasFullDetails: boolean;
  
  @Column('text', { nullable: true })
  upc: string; // For barcode scanning
  
  @Column('jsonb', { nullable: true })
  qualifiers: any[]; // For storing measure qualifiers
  
  @Column('timestamptz', { nullable: true })
  lastApiUpdate: Date; // To track when we last updated from the API
}
