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
import { ArticleCategory } from './ArticleCategory.js';

@Entity('articles')
export class Article {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  title: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { nullable: true })
  excerpt: string | undefined;

  @Column('text')
  content: string;

  @Column('text', { name: 'featured_image', nullable: true })
  featuredImage: string | undefined;

  @Column('text', { name: 'category_id', nullable: true })
  categoryId: string | undefined;

  @Column('text', { name: 'author_id', nullable: true })
  authorId: string | undefined;

  @Column('text', { name: 'publication_status', default: 'DRAFT' })
  publicationStatus: string;

  @Column('timestamp', { name: 'published_at', nullable: true })
  publishedAt: Date | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => ArticleCategory, (category) => category.articles)
  @JoinColumn({ name: 'category_id' })
  category: ArticleCategory;
}
