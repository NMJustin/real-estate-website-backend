import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Agent } from '../entities/Agent.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';
import type { DeepPartial } from 'typeorm';

const allowedViewingStatuses = new Set(['PENDING', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);

export const getAgentViewings = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const viewings = await viewingRepo.find({
      where: { agentId: agent.id },
      relations: { property: true },
      order: { preferredDate: 'DESC' },
    });

    // Filter property to only select specific fields
    const filteredViewings = viewings.map(v => ({
      ...v,
      property: v.property ? { id: v.property.id, title: v.property.title, slug: v.property.slug } : null,
    }));

    res.json({ success: true, data: filteredViewings });
  } catch (error) {
    next(error);
  }
};

export const getAgentViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const viewing = await viewingRepo.findOne({
      where: { id, agentId: agent.id },
      relations: { property: true },
    });

    if (!viewing) {
      return res.status(404).json({ success: false, message: 'Viewing not found or not assigned to you.' });
    }

    // Filter property to only select specific fields
    const filteredViewing = {
      ...viewing,
      property: viewing.property ? { id: viewing.property.id, title: viewing.property.title, slug: viewing.property.slug } : null,
    };

    res.json({ success: true, data: filteredViewing });
  } catch (error) {
    next(error);
  }
};

export const scheduleViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const { propertyId, preferredDate, preferredTime, message } = req.body;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required.' });
    }

    const viewing = viewingRepo.create({
      propertyId: String(propertyId),
      agentId: agent.id,
      name: agent.name,
      email: agent.email || '',
      phone: agent.phone,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTime,
      message,
      status: 'SCHEDULED',
    } as DeepPartial<ViewingRequest>);
    const savedViewing = await viewingRepo.save(viewing);

    const viewingWithProperty = await viewingRepo.findOne({
      where: { id: savedViewing.id },
      relations: { property: true },
    });

    // Filter property to only select specific fields
    const filteredViewing = viewingWithProperty ? {
      ...viewingWithProperty,
      property: viewingWithProperty.property ? { id: viewingWithProperty.property.id, title: viewingWithProperty.property.title, slug: viewingWithProperty.property.slug } : null,
    } : viewingWithProperty;

    res.status(201).json({ success: true, data: filteredViewing });
  } catch (error) {
    next(error);
  }
};

export const updateViewingStatus = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const { status, preferredDate, preferredTime } = req.body as {
      status?: unknown;
      preferredDate?: unknown;
      preferredTime?: unknown;
    };

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const viewing = await viewingRepo.findOne({
      where: { id, agentId: agent.id },
    });

    if (!viewing) {
      return res.status(404).json({ success: false, message: 'Viewing not found or not assigned to you.' });
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || !allowedViewingStatuses.has(status)) {
        return res.status(400).json({ success: false, message: 'Invalid viewing status.' });
      }
      viewing.status = status;
    }
    if (preferredDate !== undefined) {
      if (preferredDate === null || preferredDate === '') {
        viewing.preferredDate = undefined;
      } else if (typeof preferredDate !== 'string' || Number.isNaN(Date.parse(preferredDate))) {
        return res.status(400).json({ success: false, message: 'Invalid preferred date.' });
      } else {
        viewing.preferredDate = new Date(preferredDate);
      }
    }
    if (preferredTime !== undefined) {
      if (preferredTime !== null && typeof preferredTime !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid preferred time.' });
      }
      viewing.preferredTime = typeof preferredTime === 'string' && preferredTime.trim() ? preferredTime.trim() : undefined;
    }

    const updatedViewing = await viewingRepo.save(viewing);

    const viewingWithProperty = await viewingRepo.findOne({
      where: { id: updatedViewing.id },
      relations: { property: true },
    });

    // Filter property to only select specific fields
    const filteredViewing = viewingWithProperty ? {
      ...viewingWithProperty,
      property: viewingWithProperty.property ? { id: viewingWithProperty.property.id, title: viewingWithProperty.property.title, slug: viewingWithProperty.property.slug } : null,
    } : viewingWithProperty;

    res.json({ success: true, data: filteredViewing });
  } catch (error) {
    next(error);
  }
};
