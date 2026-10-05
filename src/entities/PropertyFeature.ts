import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { PropertyFeatureLink } from './PropertyFeatureLink.js';

@Entity('property_features')
export class PropertyFeature {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('text', { unique: true })
  slug: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PropertyFeatureLink, (link) => link.feature)
  properties: PropertyFeatureLink[];
}
