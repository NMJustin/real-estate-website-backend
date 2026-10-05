import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './Property.js';
import { User } from './User.js';

@Entity('listing_requests')
export class ListingRequest {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'property_id', nullable: true })
  propertyId: string | undefined;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('text', { name: 'property_type', default: 'RESIDENTIAL' })
  propertyType: string;

  @Column('text', { name: 'transaction_type', default: 'SALE' })
  transactionType: string;

  @Column('text')
  location: string;

  @Column('text', { nullable: true })
  district: string | undefined;

  @Column('text', { nullable: true })
  sector: string | undefined;

  @Column('decimal', { name: 'property_size', nullable: true })
  propertySize: number | undefined;

  @Column('text', { name: 'size_unit', nullable: true })
  sizeUnit: string | undefined;

  @Column('integer', { nullable: true })
  bedrooms: number | undefined;

  @Column('integer', { nullable: true })
  bathrooms: number | undefined;

  @Column('text', { nullable: true })
  description: string | undefined;

  @Column('decimal', { nullable: true })
  price: number | undefined;

  @Column('text', { default: 'SUBMITTED' })
  status: string;

  @Column('jsonb', { default: () => "'[]'::jsonb" })
  images: { imageUrl: string; mediaType: string }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.listingRequests)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.listingRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
