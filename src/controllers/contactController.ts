import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { ContactMessage } from '../entities/ContactMessage.js';

export const createContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = contactRepo.create(req.body);
    const savedContact = await contactRepo.save(contact);
    res.status(201).json({ success: true, data: savedContact });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const [contacts, total] = await contactRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      success: true,
      data: contacts,
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

export const getContactMessageById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = await contactRepo.findOne({ where: { id: String(req.params.id) } });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact message not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

export const replaceContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = await contactRepo.findOne({ where: { id: String(req.params.id) } });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact message not found' });
    Object.assign(contact, req.body);
    const updatedContact = await contactRepo.save(contact);
    res.json({ success: true, data: updatedContact });
  } catch (error) {
    next(error);
  }
};

export const updateContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = await contactRepo.findOne({ where: { id: String(req.params.id) } });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact message not found' });
    Object.assign(contact, req.body);
    const updatedContact = await contactRepo.save(contact);
    res.json({ success: true, data: updatedContact });
  } catch (error) {
    next(error);
  }
};

export const deleteContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = await contactRepo.findOne({ where: { id: String(req.params.id) } });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact message not found' });
    await contactRepo.remove(contact);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
