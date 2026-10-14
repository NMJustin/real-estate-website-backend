import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { Inquiry } from '../entities/Inquiry.js';
import { ListingRequest } from '../entities/ListingRequest.js';
import { Property } from '../entities/Property.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';

const paging = (req: Request, defaultLimit = 100) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || defaultLimit));
  return { page, limit };
};

const managerId = (req: Request) =>
  req.user?.role?.toLowerCase() === 'property_manager' ? req.user.id : undefined;

export const getManagedInquiries = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { page, limit } = paging(req);
    const query = AppDataSource.getRepository(Inquiry).createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.property', 'property')
      .orderBy('inquiry.createdAt', 'DESC');
    if (managerId(req)) query.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: managerId(req) });

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const statusQuery = AppDataSource.getRepository(Inquiry).createQueryBuilder('inquiry')
      .select('inquiry.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('inquiry.property', 'property')
      .groupBy('inquiry.status');
    if (managerId(req)) statusQuery.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: managerId(req) });
    const statusRows = await statusQuery.getRawMany<{ status: string; count: string }>();
    const statusCounts = Object.fromEntries(statusRows.map((row) => [row.status, Number(row.count)]));

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      stats: {
        statusCounts,
        newInquiries: (statusCounts.NEW || 0) + (statusCounts.PENDING || 0),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getManagedViewings = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { page, limit } = paging(req);
    const query = AppDataSource.getRepository(ViewingRequest).createQueryBuilder('viewing')
      .leftJoinAndSelect('viewing.property', 'property')
      .orderBy('viewing.preferredDate', 'ASC', 'NULLS LAST')
      .addOrderBy('viewing.createdAt', 'DESC');
    if (managerId(req)) query.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: managerId(req) });

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const upcomingQuery = AppDataSource.getRepository(ViewingRequest).createQueryBuilder('viewing')
      .innerJoin('viewing.property', 'property')
      .where('viewing.preferredDate >= :now', { now: new Date() })
      .andWhere('viewing.status IN (:...statuses)', { statuses: ['PENDING', 'SCHEDULED', 'CONFIRMED'] });
    if (managerId(req)) upcomingQuery.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: managerId(req) });
    const upcomingViewings = await upcomingQuery.getCount();

    const pendingQuery = AppDataSource.getRepository(ViewingRequest).createQueryBuilder('viewing')
      .innerJoin('viewing.property', 'property')
      .where('viewing.status = :status', { status: 'PENDING' });
    if (managerId(req)) pendingQuery.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: managerId(req) });
    const pendingViewings = await pendingQuery.getCount();

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      stats: { upcomingViewings, pendingViewings },
    });
  } catch (error) {
    return next(error);
  }
};

export const createManagedViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const body = req.body as Record<string, unknown>;
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const preferredDate = typeof body.preferredDate === 'string' ? body.preferredDate : '';
    const preferredTime = typeof body.preferredTime === 'string' ? body.preferredTime.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const status = typeof body.status === 'string' ? body.status : 'PENDING';
    if (!propertyId || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !preferredDate || Number.isNaN(Date.parse(preferredDate))) {
      return res.status(400).json({ success: false, message: 'Select a property and provide a client name, valid email, and viewing date.' });
    }
    if (!['PENDING', 'SCHEDULED', 'CONFIRMED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'New viewings must be pending, scheduled, or confirmed.' });
    }

    const requestedProperty = await AppDataSource.getRepository(Property).findOne({
      where: {
        id: propertyId,
        ...(managerId(req) ? { propertyManagerId: managerId(req) } : {}),
      },
      select: { id: true, agentId: true },
    });
    if (!requestedProperty) return res.status(404).json({ success: false, message: 'Assigned property not found.' });

    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const viewing = viewingRepo.create({
      id: randomUUID(),
      propertyId: requestedProperty.id,
      agentId: requestedProperty.agentId,
      name,
      email,
      phone: phone || undefined,
      preferredDate: new Date(preferredDate),
      preferredTime: preferredTime || undefined,
      message: message || undefined,
      status,
    });
    const savedViewing = await viewingRepo.save(viewing);
    return res.status(201).json({ success: true, data: savedViewing });
  } catch (error) {
    return next(error);
  }
};

export const getManagedListingRequests = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { page, limit } = paging(req);
    const query = AppDataSource.getRepository(ListingRequest).createQueryBuilder('request')
      .innerJoinAndSelect('request.property', 'property')
      .orderBy('request.createdAt', 'DESC');
    if (managerId(req)) query.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: managerId(req) });
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const pendingQuery = AppDataSource.getRepository(ListingRequest).createQueryBuilder('request')
      .innerJoin('request.property', 'property')
      .where('request.status IN (:...statuses)', { statuses: ['PENDING', 'SUBMITTED'] });
    if (managerId(req)) pendingQuery.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: managerId(req) });
    const pendingRequests = await pendingQuery.getCount();

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      stats: { pendingRequests },
    });
  } catch (error) {
    return next(error);
  }
};
