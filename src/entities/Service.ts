import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceRequest } from './ServiceRequest.js';

@Entity('services')
export class Service {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { name: 'short_description', nullable: true })
  shortDescription: string | undefined;

  @Column('text', { nullable: true })
  description: string | undefined;

  @Column('text', { name: 'image_url', nullable: true })
  imageUrl: string | undefined;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @Column('integer', { name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ServiceRequest, (request) => request.service)
  requests: ServiceRequest[];
}
