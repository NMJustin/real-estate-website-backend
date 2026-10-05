import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.js';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('text', { nullable: true })
  subject: string | undefined;

  @Column('text')
  message: string;

  @Column('text', { default: 'NEW' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @ManyToOne(() => User, (user) => user.contactMessages)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
