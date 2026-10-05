import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Property } from './Property.js';
import { User } from './User.js';

@Entity('favorites')
@Index(['userId', 'propertyId'], { unique: true })
export class Favorite {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'user_id' })
  userId: string;

  @Column('text', { name: 'property_id' })
  propertyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Property, (property) => property.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
