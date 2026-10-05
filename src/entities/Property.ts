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
import { Agent } from './Agent.js';
import { PropertyCategory } from './PropertyCategory.js';
import { Development } from './Development.js';
import { PropertyFeatureLink } from './PropertyFeatureLink.js';
import { PropertyImage } from './PropertyImage.js';
import { Favorite } from './Favorite.js';
import { Inquiry } from './Inquiry.js';
import { ListingRequest } from './ListingRequest.js';
import { ValuationRequest } from './ValuationRequest.js';
import { ViewingRequest } from './ViewingRequest.js';

@Entity('properties')
export class Property {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'property_id', unique: true, nullable: true })
  propertyId: string;

  @Column('text')
  title: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string | undefined;

  @Column('text', { name: 'category_id', nullable: true })
  categoryId: string | undefined;

  @Column('text', { name: 'agent_id', nullable: true })
  agentId: string | undefined;

  @Column('text', { name: 'development_id', nullable: true })
  developmentId: string | undefined;

  @Column('text', { name: 'property_type', default: 'RESIDENTIAL' })
  propertyType: string;

  @Column('text', { name: 'transaction_type', default: 'SALE' })
  transactionType: string;

  @Column('decimal', { nullable: true })
  price: number | undefined;

  @Column('text', { nullable: true })
  currency: string | undefined;

  @Column('text', { nullable: true })
  location: string | undefined;

  @Column('text', { nullable: true })
  district: string | undefined;

  @Column('text', { nullable: true })
  sector: string | undefined;

  @Column('text', { nullable: true })
  address: string | undefined;

  @Column('double precision', { nullable: true })
  latitude: number | undefined;

  @Column('double precision', { nullable: true })
  longitude: number | undefined;

  @Column('decimal', { nullable: true })
  size: number | undefined;

  @Column('text', { name: 'size_unit', nullable: true })
  sizeUnit: string | undefined;

  @Column('integer', { nullable: true })
  bedrooms: number | undefined;

  @Column('integer', { nullable: true })
  bathrooms: number | undefined;

  @Column('text', { default: 'AVAILABLE' })
  status: string;

  @Column('text', { name: 'publication_status', default: 'PUBLISHED' })
  publicationStatus: string;

  @Column('boolean', { name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column('boolean', { name: 'is_new_development', default: false })
  isNewDevelopment: boolean;

  @Column('timestamp', { name: 'listed_at', nullable: true })
  listedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('text', { name: 'furnishing_status', nullable: true })
  furnishingStatus: string | undefined;

  @Column('text', { array: true, nullable: true, default: () => "'{}'" })
  amenities: string[];

  @Column('text', { nullable: true })
  area: string | undefined;

  @Column('text', { name: 'location_description', nullable: true })
  locationDescription: string | undefined;

  @Column('text', { name: 'nearby_landmarks', nullable: true })
  nearbyLandmarks: string | undefined;

  @Column('text', { nullable: true })
  neighborhood: string | undefined;

  @Column('integer', { nullable: true })
  parking: number | undefined;

  @ManyToOne(() => Agent, (agent) => agent.properties)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => PropertyCategory, (category) => category.properties)
  @JoinColumn({ name: 'category_id' })
  category: PropertyCategory;

  @ManyToOne(() => Development, (development) => development.properties)
  @JoinColumn({ name: 'development_id' })
  development: Development;

  @OneToMany(() => PropertyFeatureLink, (link) => link.property)
  propertyFeatures: PropertyFeatureLink[];

  @OneToMany(() => PropertyImage, (image) => image.property)
  propertyImages: PropertyImage[];

  @OneToMany(() => Favorite, (favorite) => favorite.property)
  favorites: Favorite[];

  @OneToMany(() => Inquiry, (inquiry) => inquiry.property)
  inquiries: Inquiry[];

  @OneToMany(() => ListingRequest, (request) => request.property)
  listingRequests: ListingRequest[];

  @OneToMany(() => ValuationRequest, (request) => request.property)
  valuationRequests: ValuationRequest[];

  @OneToMany(() => ViewingRequest, (request) => request.property)
  viewingRequests: ViewingRequest[];
}
