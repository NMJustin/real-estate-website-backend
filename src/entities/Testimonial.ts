import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  role: string | undefined;

  @Column('text')
  content: string;

  @Column('text', { name: 'image_url', nullable: true })
  imageUrl: string | undefined;

  @Column('integer', { default: 5 })
  rating: number;

  @Column('boolean', { name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
