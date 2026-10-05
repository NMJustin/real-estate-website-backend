import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agent } from './Agent.js';
import { Property } from './Property.js';
import { User } from './User.js';

@Entity('viewing_requests')
export class ViewingRequest {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'property_id' })
  propertyId: string;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text', { name: 'agent_id', nullable: true })
  agentId: string | undefined;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('timestamp', { name: 'preferred_date', nullable: true })
  preferredDate: Date | undefined;

  @Column('text', { name: 'preferred_time', nullable: true })
  preferredTime: string | undefined;

  @Column('text', { nullable: true })
  message: string | undefined;

  @Column('text', { default: 'PENDING' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Agent, (agent) => agent.viewingRequests)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => Property, (property) => property.viewingRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.viewingRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
