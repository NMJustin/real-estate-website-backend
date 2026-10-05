import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.js';
import { Inquiry } from './Inquiry.js';
import { Property } from './Property.js';
import { ViewingRequest } from './ViewingRequest.js';

@Entity('agents')
export class Agent {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'user_id', unique: true })
  userId: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { nullable: true })
  email: string | undefined;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('text', { name: 'profile_image', nullable: true })
  profileImage: string | undefined;

  @Column('text', { nullable: true })
  bio: string | undefined;

  @Column('text', { nullable: true })
  specialization: string | undefined;

  @Column('text', { name: 'license_number', nullable: true })
  licenseNumber: string | undefined;

  @Column('integer', { name: 'years_experience', nullable: true })
  yearsExperience: number | undefined;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Inquiry, (inquiry) => inquiry.agent)
  inquiries: Inquiry[];

  @OneToMany(() => Property, (property) => property.agent)
  properties: Property[];

  @OneToMany(() => ViewingRequest, (request) => request.agent)
  viewingRequests: ViewingRequest[];
}
