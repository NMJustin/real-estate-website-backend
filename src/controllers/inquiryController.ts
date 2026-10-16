import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { Inquiry } from '../entities/Inquiry.js';
import { Property } from '../entities/Property.js';
import { Agent } from '../entities/Agent.js';
import { AgentInquiryNote } from '../entities/AgentInquiryNote.js';

const allowedInquiryStatuses = new Set(['NEW', 'PENDING', 'READ', 'CONTACTED', 'INTERESTED', 'APPROVED', 'RESOLVED', 'CLOSED']);

const serializeInquiry = (inquiry: Inquiry, note?: AgentInquiryNote) => ({
  ...inquiry,
  message: inquiry.inquiry, // Map database field 'inquiry' to frontend field 'message'
  property: inquiry.property ? { id: inquiry.property.id, title: inquiry.property.title, slug: inquiry.property.slug } : null,
  agent: inquiry.agent ? { id: inquiry.agent.id, name: inquiry.agent.name, email: inquiry.agent.email } : null,
  privateNotes: note?.notes || '',
  nextFollowUpDate: note?.nextFollowUpDate || null,
});

export const getInquiries = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const status = req.query.status as string | undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const qb = inquiryRepo.createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.property', 'property')
      .leftJoinAndSelect('inquiry.agent', 'agent')
      .select(['inquiry', 'property.id', 'property.title', 'property.slug', 'agent.id', 'agent.name', 'agent.email'])
      .orderBy('inquiry.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('inquiry.status = :status', { status });
    }
    if (search) {
      qb.andWhere('(inquiry.name ILIKE :search OR inquiry.email ILIKE :search OR inquiry.inquiry ILIKE :search)', { search: `%${search}%` });
    }

    const [inquiries, total] = await qb.getManyAndCount();
    const notes = await AppDataSource.getRepository(AgentInquiryNote).find({
      where: inquiries.map((inquiry) => ({ inquiryId: inquiry.id, agentId: inquiry.agentId! })).filter((where) => Boolean(where.agentId)),
    });
    const notesByInquiryId = new Map(notes.map((note) => [note.inquiryId, note]));

    res.json({
      success: true,
      data: inquiries.map((inquiry) => serializeInquiry(inquiry, notesByInquiryId.get(inquiry.id))),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { name, email, phone, propertyId, message } = req.body as Record<string, unknown>;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Duplicate prevention (same email, same property, within last 5 minutes)
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const whereConditions: Record<string, unknown> = { email: email.trim() };
    if (propertyId) {
      whereConditions.propertyId = String(propertyId);
    }
    const duplicate = await inquiryRepo.findOne({
      where: whereConditions,
      order: { createdAt: 'DESC' },
    });
    if (duplicate && duplicate.createdAt > fiveMinutesAgo) {
      return res.status(429).json({ success: false, message: 'You have already submitted an inquiry recently. Please wait a few minutes before trying again.' });
    }

    const inquiry = inquiryRepo.create({
      id: randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : undefined,
      propertyId: propertyId ? String(propertyId) : undefined,
      inquiry: message.trim(),
      status: 'NEW',
    });
    const savedInquiry = await inquiryRepo.save(inquiry);
    res.status(201).json({ success: true, data: savedInquiry });
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) }, relations: { property: true, agent: true } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    const note = inquiry.agentId
      ? await AppDataSource.getRepository(AgentInquiryNote).findOne({ where: { inquiryId: inquiry.id, agentId: inquiry.agentId } })
      : null;
    return res.json({ success: true, data: serializeInquiry(inquiry, note || undefined) });
  } catch (error) {
    return next(error);
  }
};

export const replaceInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) }, relations: { agent: true, property: true } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    Object.assign(inquiry, req.body);
    const updatedInquiry = await inquiryRepo.save(inquiry);
    res.json({ success: true, data: updatedInquiry });
  } catch (error) {
    next(error);
  }
};

export const updateInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    const body = req.body as Record<string, unknown>;
    for (const field of ['name', 'email', 'phone', 'inquiry'] as const) {
      if (field in body) {
        if (typeof body[field] !== 'string' || (field !== 'phone' && !body[field].trim())) {
          return res.status(400).json({ success: false, message: `Invalid ${field}.` });
        }
        const value = body[field].trim();
        if (field === 'phone') inquiry.phone = value || undefined;
        else inquiry[field] = value;
      }
    }
    if ('status' in body) {
      if (typeof body.status !== 'string' || !allowedInquiryStatuses.has(body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid inquiry status.' });
      }
      inquiry.status = body.status;
    }
    if ('agentId' in body) {
      if (body.agentId === null || body.agentId === '') {
        inquiry.agentId = undefined;
      } else if (typeof body.agentId !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid agent assignment.' });
      } else {
        const agent = await AppDataSource.getRepository(Agent).findOne({ where: { id: body.agentId, isActive: true } });
        if (!agent) return res.status(400).json({ success: false, message: 'Select an active agent.' });
        inquiry.agentId = agent.id;
        inquiry.agent = agent;
      }
    }
    const { privateNotes, nextFollowUpDate } = body;
    if (privateNotes !== undefined && (typeof privateNotes !== 'string' || privateNotes.length > 5000)) {
      return res.status(400).json({ success: false, message: 'Internal notes must be text up to 5,000 characters.' });
    }
    let followUpDate: Date | null | undefined;
    if (nextFollowUpDate !== undefined) {
      if (nextFollowUpDate === null || nextFollowUpDate === '') followUpDate = null;
      else if (typeof nextFollowUpDate !== 'string' || Number.isNaN(Date.parse(nextFollowUpDate))) {
        return res.status(400).json({ success: false, message: 'Invalid follow-up date.' });
      } else followUpDate = new Date(nextFollowUpDate);
    }
    if ((privateNotes !== undefined || followUpDate !== undefined) && !inquiry.agentId) {
      return res.status(400).json({ success: false, message: 'Assign an agent before adding internal notes or a follow-up date.' });
    }
    const updatedInquiry = await inquiryRepo.save(inquiry);
    let note: AgentInquiryNote | undefined;
    if (inquiry.agentId && (privateNotes !== undefined || followUpDate !== undefined)) {
      const noteRepo = AppDataSource.getRepository(AgentInquiryNote);
      note = await noteRepo.findOne({ where: { inquiryId: inquiry.id, agentId: inquiry.agentId } })
        || noteRepo.create({ id: randomUUID(), inquiryId: inquiry.id, agentId: inquiry.agentId, notes: '', nextFollowUpDate: null });
      if (typeof privateNotes === 'string') note.notes = privateNotes.trim();
      if (followUpDate !== undefined) note.nextFollowUpDate = followUpDate;
      note = await noteRepo.save(note);
    } else if (inquiry.agentId) {
      note = await AppDataSource.getRepository(AgentInquiryNote).findOne({ where: { inquiryId: inquiry.id, agentId: inquiry.agentId } }) || undefined;
    }
    res.json({ success: true, data: serializeInquiry(updatedInquiry, note) });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    await inquiryRepo.remove(inquiry);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
