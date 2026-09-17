import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const createContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contact = await prisma.contactMessage.create({ data: req.body });
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contacts = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};

export const updateContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const contact = await prisma.contactMessage.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

export const deleteContactMessage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    await prisma.contactMessage.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
