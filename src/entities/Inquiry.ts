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

@Entity('inquiries')
export class Inquiry {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'property_id', nullable: true })
  propertyId: string | undefined;

  @Column('text', { name: 'agent_id', nullable: true })
  agentId: string | undefined;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('text')
  message: string;

  @Column('text', { default: 'NEW' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Agent, (agent) => agent.inquiries)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => Property, (property) => property.inquiries)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.inquiries)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
