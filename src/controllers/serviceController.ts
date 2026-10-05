import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Service } from '../entities/Service.js';

export const getServices = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const services = await serviceRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

export const getAllServices = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const services = await serviceRepo.find({
      order: { displayOrder: 'ASC' },
    });
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

export const getServiceBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = await serviceRepo.findOne({ where: { slug: String(req.params.slug) } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json({ success: true, data: service });
  } catch (error) { return next(error); }
};

export const getServiceById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = await serviceRepo.findOne({ where: { id: String(req.params.id) } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json({ success: true, data: service });
  } catch (error) { return next(error); }
};

export const createService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = serviceRepo.create(req.body);
    const savedService = await serviceRepo.save(service);
    res.status(201).json({ success: true, data: savedService });
  } catch (error) { next(error); }
};

export const replaceService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = await serviceRepo.findOne({ where: { id: String(req.params.id) } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    Object.assign(service, req.body);
    const updatedService = await serviceRepo.save(service);
    res.json({ success: true, data: updatedService });
  } catch (error) { next(error); }
};

export const updateService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = await serviceRepo.findOne({ where: { id: String(req.params.id) } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    Object.assign(service, req.body);
    const updatedService = await serviceRepo.save(service);
    res.json({ success: true, data: updatedService });
  } catch (error) { next(error); }
};

export const deleteService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = await serviceRepo.findOne({ where: { id: String(req.params.id) } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await serviceRepo.remove(service);
    res.status(204).send();
  } catch (error) { next(error); }
};
