import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';
import crypto from 'crypto';

export const getViewings = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const viewings = await viewingRepo.find({ order: { createdAt: 'DESC' } });
    res.json({ success: true, data: viewings });
  } catch (error) {
    next(error);
  }
};

export const createViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { propertyId, userId, agentId, name, email, phone, preferredDate, preferredTime, message, numberOfVisitors } = req.body;
    const id = crypto.randomUUID();
    
    // Check if property exists
    const propertyExists = await AppDataSource.query(
      'SELECT id FROM properties WHERE id = $1 LIMIT 1',
      [String(propertyId)]
    );
    
    if (!propertyExists || propertyExists.length === 0) {
      return res.status(400).json({ success: false, message: 'Property not found' });
    }
    
    const query = `
      INSERT INTO viewing_requests (id, property_id, user_id, agent_id, name, email, phone, preferred_date, preferred_time, message, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;
    const result = await AppDataSource.query(query, [
      id,
      String(propertyId),
      userId || null,
      agentId || null,
      name,
      email,
      phone || null,
      preferredDate ? new Date(preferredDate) : null,
      preferredTime || null,
      message || null,
    ]);
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
};

export const getViewingById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const viewing = await viewingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!viewing) return res.status(404).json({ success: false, message: 'Viewing not found' });
    return res.json({ success: true, data: viewing });
  } catch (error) {
    return next(error);
  }
};

export const replaceViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const viewing = await viewingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!viewing) return res.status(404).json({ success: false, message: 'Viewing not found' });
    Object.assign(viewing, req.body);
    const updatedViewing = await viewingRepo.save(viewing);
    res.json({ success: true, data: updatedViewing });
  } catch (error) {
    next(error);
  }
};

export const updateViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const viewing = await viewingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!viewing) return res.status(404).json({ success: false, message: 'Viewing not found' });
    Object.assign(viewing, req.body);
    const updatedViewing = await viewingRepo.save(viewing);
    res.json({ success: true, data: updatedViewing });
  } catch (error) {
    next(error);
  }
};

export const deleteViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const viewing = await viewingRepo.findOne({ where: { id: String(req.params.id) } });
    if (!viewing) return res.status(404).json({ success: false, message: 'Viewing not found' });
    await viewingRepo.remove(viewing);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
