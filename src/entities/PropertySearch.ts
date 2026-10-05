import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.js';

@Entity('property_searches')
@Index(['userId'])
export class PropertySearch {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text', { nullable: true })
  email: string | undefined;

  @Column('text', { nullable: true })
  location: string | undefined;

  @Column('text', { name: 'property_type', nullable: true })
  propertyType: string | undefined;

  @Column('text', { name: 'transaction_type', nullable: true })
  transactionType: string | undefined;

  @Column('decimal', { name: 'min_price', nullable: true })
  minPrice: number | undefined;

  @Column('decimal', { name: 'max_price', nullable: true })
  maxPrice: number | undefined;

  @Column('integer', { name: 'min_bedrooms', nullable: true })
  minBedrooms: number | undefined;

  @Column('integer', { name: 'max_bedrooms', nullable: true })
  maxBedrooms: number | undefined;

  @Column('integer', { name: 'min_bathrooms', nullable: true })
  minBathrooms: number | undefined;

  @Column('integer', { name: 'max_bathrooms', nullable: true })
  maxBathrooms: number | undefined;

  @Column('decimal', { name: 'min_size', nullable: true })
  minSize: number | undefined;

  @Column('decimal', { name: 'max_size', nullable: true })
  maxSize: number | undefined;

  @Column('text', { name: 'size_unit', nullable: true })
  sizeUnit: string | undefined;

  @Column('text', { nullable: true })
  availability: string | undefined;

  @Column('text', { name: 'furnishing_status', nullable: true })
  furnishingStatus: string | undefined;

  @Column('text', { array: true, default: () => "'{}'" })
  features: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.propertySearches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
