import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { ContactMessage } from '../entities/ContactMessage.js';
import { isEmailConfigured, sendContactReplyEmail } from '../lib/passwordResetEmail.js';

export const createContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = contactRepo.create(req.body);
    const savedContact = await contactRepo.save(contact);
    res.status(201).json({ success: true, data: savedContact });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact message. Please try again later.' });
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
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact messages. Please try again later.' });
  }
};

export const getContactMessageById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = await contactRepo.findOne({ where: { id: String(req.params.id) } });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact message not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact message. Please try again later.' });
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
    console.error('Error replacing contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact message. Please try again later.' });
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
    console.error('Error updating contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact message. Please try again later.' });
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
    console.error('Error deleting contact message:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact message. Please try again later.' });
  }
};

export const replyToContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!subject || subject.length > 255) {
      return res.status(400).json({ success: false, message: 'Enter an email subject (up to 255 characters).' });
    }
    if (!message || message.length > 10000) {
      return res.status(400).json({ success: false, message: 'Enter a reply of up to 10,000 characters.' });
    }
    if (!isEmailConfigured()) {
      return res.status(503).json({ success: false, message: 'Email delivery is not configured.' });
    }

    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const contact = await contactRepo.findOne({ where: { id: String(req.params.id) } });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact message not found' });

    await sendContactReplyEmail({ to: contact.email, subject, message });
    contact.status = 'RESPONDED';
    const updatedContact = await contactRepo.save(contact);
    res.json({ success: true, data: updatedContact, message: 'Reply sent successfully.' });
  } catch (error) {
    console.error('Error sending contact reply email:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply email. Please try again later.' });
  }
};
