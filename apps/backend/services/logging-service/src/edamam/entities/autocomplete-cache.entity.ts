import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('autocomplete_cache')
export class AutocompleteCache {
  @PrimaryColumn('text')
  query: string;
  
  @Column('text', { array: true })
  suggestions: string[];
  
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  
  @Column('timestamptz')
  lastUsed: Date;
  
  @Column('int', { default: 1 })
  usageCount: number;
}
