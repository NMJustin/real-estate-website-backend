import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_pages')
export class SitePage {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  title: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { nullable: true })
  content: string | undefined;

  @Column('text', { name: 'page_type', nullable: true })
  pageType: string | undefined;

  @Column('text', { name: 'meta_title', nullable: true })
  metaTitle: string | undefined;

  @Column('text', { name: 'meta_description', nullable: true })
  metaDescription: string | undefined;

  @Column('boolean', { name: 'is_published', default: true })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
