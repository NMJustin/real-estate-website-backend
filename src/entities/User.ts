import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './Role.js';
import { Agent } from './Agent.js';
import { Article } from './Article.js';
import { ContactMessage } from './ContactMessage.js';
import { Favorite } from './Favorite.js';
import { Inquiry } from './Inquiry.js';
import { ListingRequest } from './ListingRequest.js';
import { PropertySearch } from './PropertySearch.js';
import { ServiceRequest } from './ServiceRequest.js';
import { ValuationRequest } from './ValuationRequest.js';
import { ViewingRequest } from './ViewingRequest.js';
import { PageView } from './PageView.js';
import { PropertyView } from './PropertyView.js';
import { ClickEvent } from './ClickEvent.js';

@Entity('users')
export class User {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { nullable: true })
  name: string | undefined;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('text', { name: 'password_hash' })
  passwordHash: string;

  @Column('integer', { name: 'role_id' })
  roleId: number;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('timestamp', { name: 'last_login_at', nullable: true })
  lastLoginAt: Date | undefined;

  @Column('boolean', { name: 'can_upload_property_media', default: false })
  canUploadPropertyMedia: boolean;

  @Column('text', { name: 'password_reset_token_hash', nullable: true })
  passwordResetTokenHash: string | null;

  @Column('timestamp', { name: 'password_reset_expires_at', nullable: true })
  passwordResetExpiresAt: Date | null;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Agent, (agent) => agent.user)
  agent: Agent[];

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => ContactMessage, (message) => message.user)
  contactMessages: ContactMessage[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Inquiry, (inquiry) => inquiry.user)
  inquiries: Inquiry[];

  @OneToMany(() => ListingRequest, (request) => request.user)
  listingRequests: ListingRequest[];

  @OneToMany(() => PropertySearch, (search) => search.user)
  propertySearches: PropertySearch[];

  @OneToMany(() => ServiceRequest, (request) => request.user)
  serviceRequests: ServiceRequest[];

  @OneToMany(() => ValuationRequest, (request) => request.user)
  valuationRequests: ValuationRequest[];

  @OneToMany(() => ViewingRequest, (request) => request.user)
  viewingRequests: ViewingRequest[];

  @OneToMany(() => PageView, (pageView) => pageView.user)
  pageViews: PageView[];

  @OneToMany(() => PropertyView, (propertyView) => propertyView.user)
  propertyViews: PropertyView[];

  @OneToMany(() => ClickEvent, (clickEvent) => clickEvent.user)
  clickEvents: ClickEvent[];
}
