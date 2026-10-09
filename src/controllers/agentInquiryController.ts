import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Agent } from '../entities/Agent.js';
import { Inquiry } from '../entities/Inquiry.js';
import { AgentInquiryNote } from '../entities/AgentInquiryNote.js';

const allowedInquiryStatuses = new Set(['NEW', 'PENDING', 'READ', 'CONTACTED', 'INTERESTED', 'APPROVED', 'RESOLVED', 'CLOSED']);

export const getAgentInquiries = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const inquiries = await inquiryRepo.find({
      where: { agentId: agent.id },
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
    const notes = await AppDataSource.getRepository(AgentInquiryNote).find({ where: { agentId: agent.id } });
    const notesByInquiryId = new Map(notes.map((note) => [note.inquiryId, note]));

    // Filter property to only select specific fields
    const filteredInquiries = inquiries.map(i => ({
      ...i,
      property: i.property ? { id: i.property.id, title: i.property.title, slug: i.property.slug } : null,
      privateNotes: notesByInquiryId.get(i.id)?.notes || '',
      nextFollowUpDate: notesByInquiryId.get(i.id)?.nextFollowUpDate || null,
    }));

    res.json({ success: true, data: filteredInquiries });
  } catch (error) {
    next(error);
  }
};

export const getAgentInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const inquiry = await inquiryRepo.findOne({
      where: { id, agentId: agent.id },
      relations: { property: true },
    });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found or not assigned to you.' });
    }

    // Filter property to only select specific fields
    const filteredInquiry = {
      ...inquiry,
      property: inquiry.property ? { id: inquiry.property.id, title: inquiry.property.title, slug: inquiry.property.slug } : null,
    };

    res.json({ success: true, data: filteredInquiry });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const { status } = req.body as { status?: unknown };
    if (typeof status !== 'string' || !allowedInquiryStatuses.has(status)) {
      return res.status(400).json({ success: false, message: 'Invalid inquiry status.' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const inquiry = await inquiryRepo.findOne({
      where: { id, agentId: agent.id },
    });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found or not assigned to you.' });
    }

    inquiry.status = status;
    const updatedInquiry = await inquiryRepo.save(inquiry);

    const inquiryWithProperty = await inquiryRepo.findOne({
      where: { id: updatedInquiry.id },
      relations: { property: true },
    });

    // Filter property to only select specific fields
    const filteredInquiry = inquiryWithProperty ? {
      ...inquiryWithProperty,
      property: inquiryWithProperty.property ? { id: inquiryWithProperty.property.id, title: inquiryWithProperty.property.title, slug: inquiryWithProperty.property.slug } : null,
    } : inquiryWithProperty;

    res.json({ success: true, data: filteredInquiry });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryFollowUp = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const { notes, nextFollowUpDate } = req.body as { notes?: unknown; nextFollowUpDate?: unknown };

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const inquiry = await inquiryRepo.findOne({
      where: { id, agentId: agent.id },
    });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found or not assigned to you.' });
    }

    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 5000)) {
      return res.status(400).json({ success: false, message: 'Private notes must be text up to 5,000 characters.' });
    }
    let parsedFollowUpDate: Date | null | undefined;
    if (nextFollowUpDate !== undefined) {
      if (nextFollowUpDate === null || nextFollowUpDate === '') {
        parsedFollowUpDate = null;
      } else if (typeof nextFollowUpDate !== 'string' || Number.isNaN(Date.parse(nextFollowUpDate))) {
        return res.status(400).json({ success: false, message: 'Invalid follow-up date.' });
      } else {
        parsedFollowUpDate = new Date(nextFollowUpDate);
      }
    }

    const noteRepo = AppDataSource.getRepository(AgentInquiryNote);
    let note = await noteRepo.findOne({ where: { agentId: agent.id, inquiryId: inquiry.id } });
    if (!note) note = noteRepo.create({ agentId: agent.id, inquiryId: inquiry.id, notes: '', nextFollowUpDate: null });
    if (typeof notes === 'string') note.notes = notes.trim();
    if (parsedFollowUpDate !== undefined) note.nextFollowUpDate = parsedFollowUpDate;
    const savedNote = await noteRepo.save(note);
    return res.json({ success: true, data: savedNote });
  } catch (error) {
    next(error);
  }
};
