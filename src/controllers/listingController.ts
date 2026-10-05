import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { ListingRequest } from '../entities/ListingRequest.js';
import { Property } from '../entities/Property.js';
import { PropertyImage } from '../entities/PropertyImage.js';

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const optionalNumber = (value: unknown) => value === '' || value === undefined || value === null || !Number.isFinite(Number(value)) ? undefined : Number(value);
const allowedImageTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const storageSecretKey = process.env.SUPABASE_SECRET_KEY;
const storageServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageApiKey = storageSecretKey || storageServiceRoleKey;
const storageBucket = process.env.SUPABASE_PROPERTY_MEDIA_BUCKET || 'property-media';

class ListingImageStorageError extends Error {}

const storageHeaders = () => ({
  ...(!storageSecretKey && storageServiceRoleKey ? { Authorization: `Bearer ${storageServiceRoleKey}` } : {}),
  apikey: storageApiKey!,
});

const uploadListingImages = async (files: Express.Multer.File[], listingId: string) => {
  if (!files.length) return { images: [] as { imageUrl: string; mediaType: string }[], paths: [] as string[] };
  if (!supabaseUrl || !storageApiKey) throw new ListingImageStorageError('Property image storage is not configured.');

  const images: { imageUrl: string; mediaType: string }[] = [];
  const paths: string[] = [];
  try {
    for (const file of files) {
      const extension = allowedImageTypes[file.mimetype];
      if (!extension) throw new Error('Only JPG, PNG, WebP, and GIF images are allowed.');

      const path = `listing-requests/${listingId}/${randomUUID()}.${extension}`;
      const response = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${path}`, {
        method: 'POST',
        headers: { ...storageHeaders(), 'Content-Type': file.mimetype, 'x-upsert': 'false' },
        body: new Uint8Array(file.buffer),
      });
      if (!response.ok) {
        const detail = await response.text();
        console.error('Listing image upload failed:', detail);
        throw new ListingImageStorageError('Unable to upload property images. Please try again.');
      }
      paths.push(path);
      images.push({
        imageUrl: `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${path}`,
        mediaType: 'IMAGE',
      });
    }
    return { images, paths };
  } catch (error) {
    await removeListingImages(paths);
    throw error;
  }
};

const removeListingImages = async (paths: string[]) => {
  if (!supabaseUrl || !storageApiKey) return;
  for (const path of paths) {
    try {
      const response = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${path}`, {
        method: 'DELETE',
        headers: storageHeaders(),
      });
      if (!response.ok) console.error(`Unable to clean up uploaded listing image (${response.status}).`);
    } catch (error) {
      console.error('Unable to clean up uploaded listing image:', error);
    }
  }
};

export const getListings = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const listings = await listingRepo.find({ order: { createdAt: 'DESC' } });
    res.json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const body = req.body as Record<string, unknown>;
    const name = String(body.name ?? body.ownerName ?? '').trim();
    const email = String(body.email ?? '').trim();
    const location = String(body.location ?? body.propertyLocation ?? '').trim();
    if (!name || !email || !location) {
      return res.status(400).json({ success: false, message: 'Owner name, email, and property location are required.' });
    }

    const id = randomUUID();
    const files = Array.isArray(req.files) ? req.files : [];
    const { images, paths } = await uploadListingImages(files, id);
    const now = new Date();
    const listing = listingRepo.create({
      id,
      name,
      email,
      phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
      propertyType: String(body.propertyType || 'RESIDENTIAL').toUpperCase(),
      transactionType: String(body.transactionType || 'SALE').toUpperCase(),
      location,
      district: typeof body.district === 'string' ? body.district : undefined,
      sector: typeof body.sector === 'string' ? body.sector : undefined,
      propertySize: optionalNumber(body.propertySize ?? body.size),
      sizeUnit: typeof body.sizeUnit === 'string' ? body.sizeUnit : undefined,
      bedrooms: optionalNumber(body.bedrooms),
      bathrooms: optionalNumber(body.bathrooms),
      description: typeof body.description === 'string' ? body.description : typeof body.propertyDescription === 'string' ? body.propertyDescription : undefined,
      price: optionalNumber(body.price ?? body.expectedPrice),
      userId: req.user?.id,
      images,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });
    let savedListing: ListingRequest;
    try {
      savedListing = await listingRepo.save(listing);
    } catch (error) {
      await removeListingImages(paths);
      throw error;
    }
    return res.status(201).json({ success: true, data: savedListing });
  } catch (error) {
    if (error instanceof ListingImageStorageError) {
      return res.status(503).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

export const approveListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const listing = await queryRunner.manager.findOne(ListingRequest, {
      where: { id: String(req.params.id) },
      lock: { mode: 'pessimistic_write' },
    });
    if (!listing) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({ success: false, message: 'Listing request not found.' });
    }
    if (listing.status !== 'PENDING' && listing.status !== 'SUBMITTED') {
      await queryRunner.rollbackTransaction();
      return res.status(409).json({ success: false, message: `Listing request is already ${listing.status.toLowerCase()}.` });
    }

    const propertyType = listing.propertyType.toUpperCase();
    const title = `${propertyType.replaceAll('_', ' ')} in ${listing.location}`;
    const baseSlug = toSlug(title) || `property-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 2;
    while (await queryRunner.manager.findOne(Property, { where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const now = new Date();
    const property = queryRunner.manager.create(Property, {
      title,
      slug,
      description: listing.description,
      propertyType,
      transactionType: listing.transactionType.toUpperCase(),
      price: listing.price,
      currency: 'RWF',
      location: listing.location,
      district: listing.district,
      sector: listing.sector,
      size: listing.propertySize,
      sizeUnit: listing.sizeUnit || 'sqm',
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      status: 'AVAILABLE',
      publicationStatus: 'PUBLISHED',
      listedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const savedProperty = await queryRunner.manager.save(property);

    for (const [index, image] of (listing.images || []).entries()) {
      await queryRunner.manager.save(queryRunner.manager.create(PropertyImage, {
        propertyId: savedProperty.id,
        imageUrl: image.imageUrl,
        mediaType: image.mediaType,
        displayOrder: index,
        isPrimary: index === 0,
        altText: `${title} property image ${index + 1}`,
      }));
    }

    listing.propertyId = savedProperty.id;
    listing.status = 'APPROVED';
    await queryRunner.manager.save(listing);
    await queryRunner.commitTransaction();

    return res.json({ success: true, data: { listing, property: savedProperty } });
  } catch (error) {
    if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
    return next(error);
  } finally {
    await queryRunner.release();
  }
};

export const rejectListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const listing = await listingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing request not found.' });
    if (listing.status !== 'PENDING' && listing.status !== 'SUBMITTED') {
      return res.status(409).json({ success: false, message: `Listing request is already ${listing.status.toLowerCase()}.` });
    }

    listing.status = 'REJECTED';
    const rejectedListing = await listingRepo.save(listing);
    return res.json({ success: true, data: rejectedListing });
  } catch (error) {
    return next(error);
  }
};

export const getListingById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const listing = await listingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing request not found' });
    return res.json({ success: true, data: listing });
  } catch (error) {
    return next(error);
  }
};

export const replaceListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const listing = await listingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing request not found' });
    Object.assign(listing, req.body);
    const updatedListing = await listingRepo.save(listing);
    res.json({ success: true, data: updatedListing });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const listing = await listingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing request not found' });
    Object.assign(listing, req.body);
    const updatedListing = await listingRepo.save(listing);
    res.json({ success: true, data: updatedListing });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const listing = await listingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing request not found' });
    await listingRepo.remove(listing);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
