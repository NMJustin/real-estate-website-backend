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

@Entity('valuation_requests')
export class ValuationRequest {
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

  @Column('text')
  location: string;

  @Column('decimal', { name: 'property_size', nullable: true })
  propertySize: number | undefined;

  @Column('integer', { nullable: true })
  bedrooms: number | undefined;

  @Column('integer', { nullable: true })
  bathrooms: number | undefined;

  @Column('text', { nullable: true })
  description: string | undefined;

  @Column('decimal', { name: 'estimated_value', nullable: true })
  estimatedValue: number | undefined;

  @Column('text', { default: 'NEW' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.valuationRequests)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.valuationRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
