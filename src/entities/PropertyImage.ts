import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Property } from './Property.js';

@Entity('property_images')
export class PropertyImage {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'property_id' })
  propertyId: string;

  @Column('text', { name: 'image_url' })
  imageUrl: string;

  @Column('text', { name: 'alt_text', nullable: true })
  altText: string | undefined;

  @Column('integer', { name: 'display_order', default: 0 })
  displayOrder: number;

  @Column('boolean', { name: 'is_primary', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('text', { name: 'media_type', default: 'IMAGE' })
  mediaType: string;

  @ManyToOne(() => Property, (property) => property.propertyImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
