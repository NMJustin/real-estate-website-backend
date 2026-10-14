import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.js';
import { Property } from './Property.js';

@Entity('property_views')
@Index(['userId'])
@Index(['propertyId'])
@Index(['createdAt'])
export class PropertyView {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text', { name: 'session_id', nullable: true })
  sessionId: string | undefined;

  @Column('text', { name: 'property_id' })
  propertyId: string;

  @Column('text', { name: 'session_duration_seconds', nullable: true })
  sessionDurationSeconds: number | undefined;

  @Column('text', { name: 'referrer', nullable: true })
  referrer: string | undefined;

  @Column('text', { name: 'device_type', nullable: true })
  deviceType: string | undefined;

  @Column('text', { name: 'ip_address', nullable: true })
  ipAddress: string | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.propertyViews, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Property, (property) => property.propertyViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
