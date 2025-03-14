import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('search_term_cache')
export class SearchTermCache {
  @PrimaryColumn('text')
  searchTerm: string;
  
  @Column('text', { array: true })
  foodIds: string[];
  
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  
  @Column('timestamptz', { nullable: true })
  lastUsed: Date;
  
  @Column('int', { default: 1 })
  usageCount: number;
}
