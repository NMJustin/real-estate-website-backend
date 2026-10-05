import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './Property.js';

@Entity('developments')
export class Development {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string | undefined;

  @Column('text', { nullable: true })
  location: string | undefined;

  @Column('text', { name: 'developer_name', nullable: true })
  developerName: string | undefined;

  @Column('text', { nullable: true })
  status: string | undefined;

  @Column('timestamp', { name: 'completion_date', nullable: true })
  completionDate: Date | undefined;

  @Column('text', { name: 'image_url', nullable: true })
  imageUrl: string | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Property, (property) => property.development)
  properties: Property[];
}
