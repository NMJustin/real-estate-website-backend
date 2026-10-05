import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'site_name', nullable: true })
  siteName: string | undefined;

  @Column('text', { name: 'logo_url', nullable: true })
  logoUrl: string | undefined;

  @Column('text', { name: 'favicon_url', nullable: true })
  faviconUrl: string | undefined;

  @Column('text', { nullable: true })
  email: string | undefined;

  @Column('text', { nullable: true })
  phone: string | undefined;

  @Column('text', { nullable: true })
  address: string | undefined;

  @Column('text', { name: 'facebook_url', nullable: true })
  facebookUrl: string | undefined;

  @Column('text', { name: 'instagram_url', nullable: true })
  instagramUrl: string | undefined;

  @Column('text', { name: 'x_url', nullable: true })
  xUrl: string | undefined;

  @Column('text', { name: 'linkedin_url', nullable: true })
  linkedinUrl: string | undefined;

  @Column('text', { name: 'default_currency', nullable: true })
  defaultCurrency: string | undefined;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('text', { name: 'about_cta_link', nullable: true })
  aboutCtaLink: string | undefined;

  @Column('text', { name: 'about_cta_text', nullable: true })
  aboutCtaText: string | undefined;

  @Column('text', { name: 'about_description', nullable: true })
  aboutDescription: string | undefined;

  @Column('text', { name: 'about_image_url', nullable: true })
  aboutImageUrl: string | undefined;

  @Column('text', { name: 'about_title', nullable: true })
  aboutTitle: string | undefined;

  @Column('text', { name: 'featured_section_title', nullable: true })
  featuredSectionTitle: string | undefined;

  @Column('text', { name: 'hero_cta_link', nullable: true })
  heroCtaLink: string | undefined;

  @Column('text', { name: 'hero_cta_text', nullable: true })
  heroCtaText: string | undefined;

  @Column('text', { name: 'hero_image_url', nullable: true })
  heroImageUrl: string | undefined;

  @Column('text', { name: 'hero_subtitle', nullable: true })
  heroSubtitle: string | undefined;

  @Column('text', { name: 'hero_title', nullable: true })
  heroTitle: string | undefined;

  @Column('text', { name: 'services_description', nullable: true })
  servicesDescription: string | undefined;

  @Column('text', { name: 'services_title', nullable: true })
  servicesTitle: string | undefined;

  @Column('boolean', { name: 'show_about_section', default: false })
  showAboutSection: boolean;

  @Column('boolean', { name: 'show_featured_section', default: false })
  showFeaturedSection: boolean;

  @Column('boolean', { name: 'show_services_section', default: false })
  showServicesSection: boolean;

  @Column('text', { nullable: true })
  whatsapp: string | undefined;
}
