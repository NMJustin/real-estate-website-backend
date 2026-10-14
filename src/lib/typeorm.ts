import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { databaseConfig, getDatabaseUrl } from '../config/database.js';
import { TextIdSubscriber } from './TextIdSubscriber.js';
import { User } from '../entities/User.js';
import { Role } from '../entities/Role.js';
import { Agent } from '../entities/Agent.js';
import { Property } from '../entities/Property.js';
import { PropertyCategory } from '../entities/PropertyCategory.js';
import { PropertyFeature } from '../entities/PropertyFeature.js';
import { PropertyFeatureLink } from '../entities/PropertyFeatureLink.js';
import { PropertyImage } from '../entities/PropertyImage.js';
import { Article } from '../entities/Article.js';
import { ArticleCategory } from '../entities/ArticleCategory.js';
import { ContactMessage } from '../entities/ContactMessage.js';
import { Development } from '../entities/Development.js';
import { Faq } from '../entities/Faq.js';
import { Favorite } from '../entities/Favorite.js';
import { Inquiry } from '../entities/Inquiry.js';
import { ListingRequest } from '../entities/ListingRequest.js';
import { PropertySearch } from '../entities/PropertySearch.js';
import { Service } from '../entities/Service.js';
import { ServiceRequest } from '../entities/ServiceRequest.js';
import { SitePage } from '../entities/SitePage.js';
import { SiteSetting } from '../entities/SiteSetting.js';
import { Testimonial } from '../entities/Testimonial.js';
import { ValuationRequest } from '../entities/ValuationRequest.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';
import { PageView } from '../entities/PageView.js';
import { PropertyView } from '../entities/PropertyView.js';
import { ClickEvent } from '../entities/ClickEvent.js';
import { AgentInquiryNote } from '../entities/AgentInquiryNote.js';

dotenv.config();

const isCompiled = import.meta.url.includes('/dist/');

// Keep the provider's connection URL intact. In particular, Neon pooled URLs
// use a different host from direct URLs and should not be rewritten at runtime.
const databaseUrl = getDatabaseUrl();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  synchronize: databaseConfig.synchronize,
  logging: databaseConfig.logging,
  entities: [
    User,
    Role,
    Agent,
    Property,
    PropertyCategory,
    PropertyFeature,
    PropertyFeatureLink,
    PropertyImage,
    Article,
    ArticleCategory,
    ContactMessage,
    Development,
    Faq,
    Favorite,
    Inquiry,
    ListingRequest,
    PropertySearch,
    Service,
    ServiceRequest,
    SitePage,
    SiteSetting,
    Testimonial,
    ValuationRequest,
    ViewingRequest,
    PageView,
    PropertyView,
    ClickEvent,
    AgentInquiryNote,
  ],
  migrations: [isCompiled ? 'dist/migrations/**/*.js' : 'src/migrations/**/*.ts'],
  subscribers: [TextIdSubscriber],
  // Neon requires TLS; sslmode=require is retained from DATABASE_URL.
});

export default AppDataSource;
