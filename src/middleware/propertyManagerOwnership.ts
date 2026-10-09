import type { RequestHandler } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Inquiry } from '../entities/Inquiry.js';
import { Property } from '../entities/Property.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';

const notFound = (res: Parameters<RequestHandler>[1]) =>
  res.status(404).json({ success: false, message: 'Resource not found.' });

const isAdmin = (role?: string) => role?.toLowerCase() === 'admin';
const isManager = (role?: string) => role?.toLowerCase() === 'property_manager';

export const assignPropertyManager: RequestHandler = (req, res, next) => {
  if (isAdmin(req.user?.role)) return next();
  if (!isManager(req.user?.role) || !req.user?.id) {
    return res.status(401).json({ success: false, message: 'Property manager authentication is required.' });
  }
  req.body = { ...req.body, propertyManagerId: req.user.id };
  return next();
};

export const requireOwnedManagerProperty: RequestHandler = async (req, res, next) => {
  if (isAdmin(req.user?.role)) return next();
  if (!isManager(req.user?.role) || !req.user?.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions.' });
  }
  try {
    const property = await AppDataSource.getRepository(Property).findOne({
      where: { id: String(req.params.id), propertyManagerId: req.user.id },
      select: { id: true },
    });
    return property ? next() : notFound(res);
  } catch (error) {
    return next(error);
  }
};

export const requireOwnedManagerInquiry: RequestHandler = async (req, res, next) => {
  if (isAdmin(req.user?.role)) return next();
  if (!isManager(req.user?.role) || !req.user?.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions.' });
  }
  try {
    const inquiry = await AppDataSource.getRepository(Inquiry).createQueryBuilder('inquiry')
      .innerJoin('inquiry.property', 'property')
      .where('inquiry.id = :id', { id: String(req.params.id) })
      .andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: req.user.id })
      .select(['inquiry.id'])
      .getOne();
    return inquiry ? next() : notFound(res);
  } catch (error) {
    return next(error);
  }
};

export const requireOwnedManagerViewing: RequestHandler = async (req, res, next) => {
  if (isAdmin(req.user?.role)) return next();
  if (!isManager(req.user?.role) || !req.user?.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions.' });
  }
  try {
    const viewing = await AppDataSource.getRepository(ViewingRequest).createQueryBuilder('viewing')
      .innerJoin('viewing.property', 'property')
      .where('viewing.id = :id', { id: String(req.params.id) })
      .andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: req.user.id })
      .select(['viewing.id'])
      .getOne();
    return viewing ? next() : notFound(res);
  } catch (error) {
    return next(error);
  }
};
