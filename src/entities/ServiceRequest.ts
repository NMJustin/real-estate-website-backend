import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './Service.js';
import { User } from './User.js';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'service_id' })
  serviceId: string;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('text', { nullable: true })
  message: string | undefined;

  @Column('text', { default: 'NEW' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Service, (service) => service.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => User, (user) => user.serviceRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
