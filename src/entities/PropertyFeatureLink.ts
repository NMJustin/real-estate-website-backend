import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from './Property.js';
import { PropertyFeature } from './PropertyFeature.js';

@Entity('property_feature_links')
export class PropertyFeatureLink {
  @PrimaryColumn('text', { name: 'property_id' })
  propertyId: string;

  @PrimaryColumn('text', { name: 'feature_id' })
  featureId: string;

  @ManyToOne(() => Property, (property) => property.propertyFeatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => PropertyFeature, (feature) => feature.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feature_id' })
  feature: PropertyFeature;
}
