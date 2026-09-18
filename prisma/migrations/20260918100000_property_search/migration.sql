ALTER TABLE "properties"
ADD COLUMN "furnishing_status" TEXT;

CREATE TABLE "property_searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "location" TEXT,
    "property_type" TEXT,
    "transaction_type" TEXT,
    "min_price" DECIMAL(65,30),
    "max_price" DECIMAL(65,30),
    "min_bedrooms" INTEGER,
    "max_bedrooms" INTEGER,
    "min_bathrooms" INTEGER,
    "max_bathrooms" INTEGER,
    "min_size" DECIMAL(65,30),
    "max_size" DECIMAL(65,30),
    "size_unit" TEXT,
    "availability" TEXT,
    "furnishing_status" TEXT,
    "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_searches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "property_searches_user_id_idx" ON "property_searches"("user_id");

ALTER TABLE "property_searches"
ADD CONSTRAINT "property_searches_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;