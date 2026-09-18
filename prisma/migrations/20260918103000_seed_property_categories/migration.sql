INSERT INTO "property_categories" ("id", "name", "slug", "description", "is_active", "created_at", "updated_at")
VALUES
  ('portfolio-houses', 'Houses', 'houses', 'Standalone residential houses', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-apartments', 'Apartments', 'apartments', 'Apartment homes and units', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-villas', 'Villas', 'villas', 'Luxury villas and estates', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-commercial-buildings', 'Commercial Buildings', 'commercial-buildings', 'Multi-purpose commercial buildings', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-office-spaces', 'Office Spaces', 'office-spaces', 'Office buildings and suites', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-retail-spaces', 'Retail Spaces', 'retail-spaces', 'Shops and retail premises', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-warehouses', 'Warehouses', 'warehouses', 'Storage and distribution warehouses', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-industrial-properties', 'Industrial Properties', 'industrial-properties', 'Industrial facilities and sites', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-land', 'Land', 'land', 'General land parcels', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-residential-plots', 'Residential Plots', 'residential-plots', 'Plots intended for residential development', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-commercial-plots', 'Commercial Plots', 'commercial-plots', 'Plots intended for commercial development', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-agricultural-land', 'Agricultural Land', 'agricultural-land', 'Land intended for agricultural use', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-hotels-hospitality', 'Hotels and Hospitality', 'hotels-hospitality', 'Hotels, lodges, and hospitality properties', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('portfolio-new-property-developments', 'New Property Developments', 'new-property-developments', 'New and planned property developments', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "is_active" = true,
  "updated_at" = CURRENT_TIMESTAMP;