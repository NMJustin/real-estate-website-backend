import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './Property.js';

@Entity('property_categories')
export class PropertyCategory {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string | undefined;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('text', { name: 'image_url', nullable: true })
  imageUrl: string | undefined;

  @OneToMany(() => Property, (property) => property.category)
  properties: Property[];
}
