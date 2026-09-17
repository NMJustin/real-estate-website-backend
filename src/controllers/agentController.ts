import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getAgents = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const agents = await prisma.agent.findMany({ include: { properties: true }, orderBy: { name: 'asc' } });
    res.json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

export const getAgentBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const agent = await prisma.agent.findUnique({ where: { slug: String(req.params.slug) }, include: { properties: true } });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    return res.json({ success: true, data: agent });
  } catch (error) {
    return next(error);
  }
};

export const createAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const agent = await prisma.agent.create({ data: req.body }); res.status(201).json({ success: true, data: agent }); } catch (error) { next(error); }
};

export const replaceAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const agent = await prisma.agent.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: agent }); } catch (error) { next(error); }
};

export const updateAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const agent = await prisma.agent.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: agent }); } catch (error) { next(error); }
};

export const deleteAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { await prisma.agent.delete({ where: { id: String(req.params.id) } }); res.status(204).send(); } catch (error) { next(error); }
};
