import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.js';

@Entity('page_views')
@Index(['userId'])
@Index(['pagePath'])
@Index(['createdAt'])
export class PageView {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'user_id', nullable: true })
  userId: string | undefined;

  @Column('text', { name: 'session_id', nullable: true })
  sessionId: string | undefined;

  @Column('text', { name: 'page_path' })
  pagePath: string;

  @Column('text', { name: 'page_title', nullable: true })
  pageTitle: string | undefined;

  @Column('text', { name: 'referrer', nullable: true })
  referrer: string | undefined;

  @Column('text', { name: 'utm_source', nullable: true })
  utmSource: string | undefined;

  @Column('text', { name: 'utm_medium', nullable: true })
  utmMedium: string | undefined;

  @Column('text', { name: 'utm_campaign', nullable: true })
  utmCampaign: string | undefined;

  @Column('text', { name: 'utm_term', nullable: true })
  utmTerm: string | undefined;

  @Column('text', { name: 'utm_content', nullable: true })
  utmContent: string | undefined;

  @Column('text', { name: 'device_type', nullable: true })
  deviceType: string | undefined;

  @Column('text', { name: 'browser', nullable: true })
  browser: string | undefined;

  @Column('text', { name: 'os', nullable: true })
  os: string | undefined;

  @Column('text', { name: 'ip_address', nullable: true })
  ipAddress: string | undefined;

  @Column('text', { name: 'country', nullable: true })
  country: string | undefined;

  @Column('text', { name: 'city', nullable: true })
  city: string | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.pageViews, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
