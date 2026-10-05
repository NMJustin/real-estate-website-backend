import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetDatabaseSchema20261002000001 implements MigrationInterface {
  name = 'ResetDatabaseSchema20261002000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all existing tables in reverse dependency order
    const tables = [
      'property_feature_links',
      'property_images',
      'favorites',
      'inquiries',
      'listing_requests',
      'valuation_requests',
      'viewing_requests',
      'property_searches',
      'service_requests',
      'contact_messages',
      'articles',
      'developments',
      'properties',
      'property_features',
      'property_categories',
      'services',
      'site_pages',
      'site_settings',
      'testimonials',
      'faqs',
      'agents',
      'article_categories',
      'users',
      'roles',
    ];

    for (const table of tables) {
      try {
        await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      } catch (error) {
        // Table might not exist, continue
      }
    }

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL PRIMARY KEY,
        "name" text NOT NULL UNIQUE,
        "description" text
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" text PRIMARY KEY,
        "name" text,
        "email" text NOT NULL UNIQUE,
        "phone" text,
        "password_hash" text NOT NULL,
        "role_id" integer NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "last_login_at" timestamp,
        "can_upload_property_media" boolean DEFAULT false NOT NULL,
        CONSTRAINT "fk_users_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id")
      )
    `);

    // Create article_categories table
    await queryRunner.query(`
      CREATE TABLE "article_categories" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL UNIQUE,
        "slug" text NOT NULL UNIQUE,
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "image_url" text
      )
    `);

    // Create agents table
    await queryRunner.query(`
      CREATE TABLE "agents" (
        "id" text PRIMARY KEY,
        "user_id" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "email" text,
        "phone" text,
        "profile_image" text,
        "bio" text,
        "specialization" text,
        "license_number" text,
        "years_experience" integer,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_agents_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create faqs table
    await queryRunner.query(`
      CREATE TABLE "faqs" (
        "id" text PRIMARY KEY,
        "question" text NOT NULL,
        "answer" text NOT NULL,
        "category" text,
        "display_order" integer DEFAULT 0 NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create testimonials table
    await queryRunner.query(`
      CREATE TABLE "testimonials" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "role" text,
        "content" text NOT NULL,
        "image_url" text,
        "rating" integer DEFAULT 5 NOT NULL,
        "is_featured" boolean DEFAULT false NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create site_settings table
    await queryRunner.query(`
      CREATE TABLE "site_settings" (
        "id" text PRIMARY KEY,
        "site_name" text,
        "logo_url" text,
        "favicon_url" text,
        "email" text,
        "phone" text,
        "address" text,
        "facebook_url" text,
        "instagram_url" text,
        "x_url" text,
        "linkedin_url" text,
        "default_currency" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "about_cta_link" text,
        "about_cta_text" text,
        "about_description" text,
        "about_image_url" text,
        "about_title" text,
        "featured_section_title" text,
        "hero_cta_link" text,
        "hero_cta_text" text,
        "hero_image_url" text,
        "hero_subtitle" text,
        "hero_title" text,
        "services_description" text,
        "services_title" text,
        "show_about_section" boolean DEFAULT false NOT NULL,
        "show_featured_section" boolean DEFAULT false NOT NULL,
        "show_services_section" boolean DEFAULT false NOT NULL,
        "whatsapp" text
      )
    `);

    // Create site_pages table
    await queryRunner.query(`
      CREATE TABLE "site_pages" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "content" text,
        "page_type" text,
        "meta_title" text,
        "meta_description" text,
        "is_published" boolean DEFAULT true NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "short_description" text,
        "description" text,
        "image_url" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "display_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create property_categories table
    await queryRunner.query(`
      CREATE TABLE "property_categories" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL UNIQUE,
        "slug" text NOT NULL UNIQUE,
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "image_url" text
      )
    `);

    // Create property_features table
    await queryRunner.query(`
      CREATE TABLE "property_features" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL UNIQUE,
        "slug" text NOT NULL UNIQUE,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create developments table
    await queryRunner.query(`
      CREATE TABLE "developments" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "description" text,
        "location" text,
        "developer_name" text,
        "status" text,
        "completion_date" timestamp,
        "image_url" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create articles table
    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "excerpt" text,
        "content" text NOT NULL,
        "featured_image" text,
        "category_id" text,
        "author_id" text,
        "publication_status" text DEFAULT 'DRAFT' NOT NULL,
        "published_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_articles_category" FOREIGN KEY ("category_id") REFERENCES "article_categories"("id"),
        CONSTRAINT "fk_articles_author" FOREIGN KEY ("author_id") REFERENCES "users"("id")
      )
    `);

    // Create properties table
    await queryRunner.query(`
      CREATE TABLE "properties" (
        "id" text PRIMARY KEY,
        "property_id" text UNIQUE,
        "title" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "description" text,
        "category_id" text,
        "agent_id" text,
        "development_id" text,
        "property_type" text DEFAULT 'RESIDENTIAL' NOT NULL,
        "transaction_type" text DEFAULT 'SALE' NOT NULL,
        "price" numeric,
        "currency" text,
        "location" text,
        "district" text,
        "sector" text,
        "address" text,
        "latitude" double precision,
        "longitude" double precision,
        "size" numeric,
        "size_unit" text,
        "bedrooms" integer,
        "bathrooms" integer,
        "status" text DEFAULT 'AVAILABLE' NOT NULL,
        "publication_status" text DEFAULT 'PUBLISHED' NOT NULL,
        "is_featured" boolean DEFAULT false NOT NULL,
        "is_new_development" boolean DEFAULT false NOT NULL,
        "listed_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "furnishing_status" text,
        "amenities" text[] DEFAULT '{}' NOT NULL,
        "area" text,
        "location_description" text,
        "nearby_landmarks" text,
        "neighborhood" text,
        "parking" integer,
        CONSTRAINT "fk_properties_category" FOREIGN KEY ("category_id") REFERENCES "property_categories"("id"),
        CONSTRAINT "fk_properties_agent" FOREIGN KEY ("agent_id") REFERENCES "agents"("id"),
        CONSTRAINT "fk_properties_development" FOREIGN KEY ("development_id") REFERENCES "developments"("id")
      )
    `);

    // Create property_images table
    await queryRunner.query(`
      CREATE TABLE "property_images" (
        "id" text PRIMARY KEY,
        "property_id" text NOT NULL,
        "image_url" text NOT NULL,
        "alt_text" text,
        "display_order" integer DEFAULT 0 NOT NULL,
        "is_primary" boolean DEFAULT false NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "media_type" text DEFAULT 'IMAGE' NOT NULL,
        CONSTRAINT "fk_property_images_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
      )
    `);

    // Create property_feature_links table (junction table)
    await queryRunner.query(`
      CREATE TABLE "property_feature_links" (
        "property_id" text NOT NULL,
        "feature_id" text NOT NULL,
        PRIMARY KEY ("property_id", "feature_id"),
        CONSTRAINT "fk_property_feature_links_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_property_feature_links_feature" FOREIGN KEY ("feature_id") REFERENCES "property_features"("id") ON DELETE CASCADE
      )
    `);

    // Create favorites table
    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" text PRIMARY KEY,
        "user_id" text NOT NULL,
        "property_id" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_favorites_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_favorites_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_favorites_user_property" UNIQUE ("user_id", "property_id")
      )
    `);

    // Create inquiries table
    await queryRunner.query(`
      CREATE TABLE "inquiries" (
        "id" text PRIMARY KEY,
        "property_id" text,
        "agent_id" text,
        "user_id" text,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "message" text NOT NULL,
        "status" text DEFAULT 'NEW' NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inquiries_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id"),
        CONSTRAINT "fk_inquiries_agent" FOREIGN KEY ("agent_id") REFERENCES "agents"("id"),
        CONSTRAINT "fk_inquiries_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create listing_requests table
    await queryRunner.query(`
      CREATE TABLE "listing_requests" (
        "id" text PRIMARY KEY,
        "property_id" text,
        "user_id" text,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "property_type" text DEFAULT 'RESIDENTIAL' NOT NULL,
        "transaction_type" text DEFAULT 'SALE' NOT NULL,
        "location" text NOT NULL,
        "district" text,
        "sector" text,
        "property_size" numeric,
        "size_unit" text,
        "bedrooms" integer,
        "bathrooms" integer,
        "description" text,
        "price" numeric,
        "images" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "status" text DEFAULT 'SUBMITTED' NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_listing_requests_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id"),
        CONSTRAINT "fk_listing_requests_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create valuation_requests table
    await queryRunner.query(`
      CREATE TABLE "valuation_requests" (
        "id" text PRIMARY KEY,
        "property_id" text,
        "user_id" text,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "property_type" text DEFAULT 'RESIDENTIAL' NOT NULL,
        "location" text NOT NULL,
        "property_size" numeric,
        "bedrooms" integer,
        "bathrooms" integer,
        "description" text,
        "estimated_value" numeric,
        "status" text DEFAULT 'NEW' NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_valuation_requests_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id"),
        CONSTRAINT "fk_valuation_requests_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create viewing_requests table
    await queryRunner.query(`
      CREATE TABLE "viewing_requests" (
        "id" text PRIMARY KEY,
        "property_id" text NOT NULL,
        "user_id" text,
        "agent_id" text,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "preferred_date" timestamp,
        "preferred_time" text,
        "message" text,
        "status" text DEFAULT 'PENDING' NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_viewing_requests_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_viewing_requests_agent" FOREIGN KEY ("agent_id") REFERENCES "agents"("id"),
        CONSTRAINT "fk_viewing_requests_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create property_searches table
    await queryRunner.query(`
      CREATE TABLE "property_searches" (
        "id" text PRIMARY KEY,
        "user_id" text,
        "email" text,
        "location" text,
        "property_type" text,
        "transaction_type" text,
        "min_price" numeric,
        "max_price" numeric,
        "min_bedrooms" integer,
        "max_bedrooms" integer,
        "min_bathrooms" integer,
        "max_bathrooms" integer,
        "min_size" numeric,
        "max_size" numeric,
        "size_unit" text,
        "availability" text,
        "furnishing_status" text,
        "features" text[] DEFAULT '{}' NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_property_searches_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create service_requests table
    await queryRunner.query(`
      CREATE TABLE "service_requests" (
        "id" text PRIMARY KEY,
        "service_id" text NOT NULL,
        "user_id" text,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "message" text,
        "status" text DEFAULT 'NEW' NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_service_requests_service" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_service_requests_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create contact_messages table
    await queryRunner.query(`
      CREATE TABLE "contact_messages" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "subject" text,
        "message" text NOT NULL,
        "status" text DEFAULT 'NEW' NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "user_id" text,
        CONSTRAINT "fk_contact_messages_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`CREATE INDEX "idx_properties_status" ON "properties"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_publication_status" ON "properties"("publication_status")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_agent_id" ON "properties"("agent_id")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_category_id" ON "properties"("category_id")`);
    await queryRunner.query(`CREATE INDEX "idx_properties_slug" ON "properties"("slug")`);
    await queryRunner.query(`CREATE INDEX "idx_inquiries_status" ON "inquiries"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_inquiries_property_id" ON "inquiries"("property_id")`);
    await queryRunner.query(`CREATE INDEX "idx_viewing_requests_status" ON "viewing_requests"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_viewing_requests_property_id" ON "viewing_requests"("property_id")`);
    await queryRunner.query(`CREATE INDEX "idx_property_searches_user_id" ON "property_searches"("user_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is a complete reset, so down is not practical
    throw new Error('This migration performs a complete database reset. Manual intervention required to restore previous state.');
  }
}
