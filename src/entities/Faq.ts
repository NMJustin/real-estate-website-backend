import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('faqs')
export class Faq {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  question: string;

  @Column('text')
  answer: string;

  @Column('text', { nullable: true })
  category: string | undefined;

  @Column('integer', { name: 'display_order', default: 0 })
  displayOrder: number;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
