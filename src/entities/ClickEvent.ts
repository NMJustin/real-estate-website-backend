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

export type ClickEventType = 'CTA' | 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'LINK' | 'BUTTON';

@Entity('click_events')
@Index(['userId'])
@Index(['eventType'])
@Index(['propertyId'])
@Index(['createdAt'])
export class ClickEvent {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text', { name: 'session_id', nullable: true })
  sessionId: string | undefined;

  @Column('text', { name: 'event_type' })
  eventType: ClickEventType;

  @Column('text', { name: 'property_id', nullable: true })
  propertyId: string | undefined;

  @Column('text', { name: 'element_id', nullable: true })
  elementId: string | undefined;

  @Column('text', { name: 'element_text', nullable: true })
  elementText: string | undefined;

  @Column('text', { name: 'page_path' })
  pagePath: string;

  @Column('text', { name: 'destination_url', nullable: true })
  destinationUrl: string | undefined;

  @Column('text', { name: 'device_type', nullable: true })
  deviceType: string | undefined;

  @Column('text', { name: 'ip_address', nullable: true })
  ipAddress: string | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.clickEvents, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Property, (property) => property.clickEvents, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
