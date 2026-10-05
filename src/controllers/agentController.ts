import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Agent } from '../entities/Agent.js';
import { Property } from '../entities/Property.js';

export const getAgents = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const agentRepo = AppDataSource.getRepository(Agent);
    const propertyRepo = AppDataSource.getRepository(Property);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const [agents, total] = await agentRepo.findAndCount({
      relations: { user: { role: true } },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Manually count properties for each agent
    const agentsWithCount = await Promise.all(
      agents.map(async (agent) => {
        const count = await propertyRepo.count({ where: { agentId: agent.id } });
        return { ...agent, _count: { properties: count } };
      })
    );

    // Transform data to match frontend expectations
    const transformedAgents = agentsWithCount.map(agent => ({
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      email: agent.email || agent.user?.email || '',
      phone: agent.phone,
      role: agent.user?.role?.name || 'Agent',
      status: agent.isActive ? 'Active' : 'Inactive',
      avatarUrl: agent.profileImage,
      createdAt: agent.createdAt,
      _count: agent._count
    }));

    res.json({
      success: true,
      data: transformedAgents,
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

export const getAgentBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = await agentRepo.findOne({
      where: { slug: String(req.params.slug) },
      relations: { properties: true },
    });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    return res.json({ success: true, data: agent });
  } catch (error) {
    return next(error);
  }
};

export const getAgentById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const agentRepo = AppDataSource.getRepository(Agent);
    const propertyRepo = AppDataSource.getRepository(Property);
    const agent = await agentRepo.findOne({
      where: { id: String(id) },
      relations: { user: { role: true } },
    });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    const count = await propertyRepo.count({ where: { agentId: agent.id } });
    const agentWithCount = { ...agent, _count: { properties: count } };

    return res.json({ success: true, data: agentWithCount });
  } catch (error) {
    return next(error);
  }
};

export const createAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { userId, name, slug, email, phone, profileImage, bio, specialization, licenseNumber, yearsExperience } = req.body;

    if (!userId || !name || !slug) {
      return res.status(400).json({ success: false, message: 'userId, name, and slug are required.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = agentRepo.create({
      userId: String(userId),
      name: String(name),
      slug: String(slug),
      email: email ? String(email) : undefined,
      phone: phone ? String(phone) : undefined,
      profileImage: profileImage ? String(profileImage) : undefined,
      bio: bio ? String(bio) : undefined,
      specialization: specialization ? String(specialization) : undefined,
      licenseNumber: licenseNumber ? String(licenseNumber) : undefined,
      yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
    });
    const savedAgent = await agentRepo.save(agent);

    const agentWithUser = await agentRepo.findOne({
      where: { id: savedAgent.id },
      relations: { user: true },
    });

    res.status(201).json({ success: true, data: agentWithUser });
  } catch (error) {
    next(error);
  }
};

export const replaceAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { userId, name, slug, email, phone, profileImage, bio, specialization, licenseNumber, yearsExperience, isActive } = req.body;

    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = await agentRepo.findOne({ where: { id: String(id) } });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    if (userId !== undefined) agent.userId = String(userId);
    if (name !== undefined) agent.name = String(name);
    if (slug !== undefined) agent.slug = String(slug);
    if (email !== undefined) agent.email = email ? String(email) : undefined;
    if (phone !== undefined) agent.phone = phone ? String(phone) : undefined;
    if (profileImage !== undefined) agent.profileImage = profileImage ? String(profileImage) : undefined;
    if (bio !== undefined) agent.bio = bio ? String(bio) : undefined;
    if (specialization !== undefined) agent.specialization = specialization ? String(specialization) : undefined;
    if (licenseNumber !== undefined) agent.licenseNumber = licenseNumber ? String(licenseNumber) : undefined;
    if (yearsExperience !== undefined) agent.yearsExperience = yearsExperience ? Number(yearsExperience) : undefined;
    if (isActive !== undefined) agent.isActive = Boolean(isActive);

    const updatedAgent = await agentRepo.save(agent);

    const agentWithUser = await agentRepo.findOne({
      where: { id: updatedAgent.id },
      relations: { user: true },
    });

    res.json({ success: true, data: agentWithUser });
  } catch (error) {
    next(error);
  }
};

export const updateAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = await agentRepo.findOne({ where: { id: String(id) } });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    Object.assign(agent, req.body);
    const updatedAgent = await agentRepo.save(agent);

    const agentWithUser = await agentRepo.findOne({
      where: { id: updatedAgent.id },
      relations: { user: true },
    });

    res.json({ success: true, data: agentWithUser });
  } catch (error) {
    next(error);
  }
};

export const deleteAgent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = await agentRepo.findOne({ where: { id: String(id) } });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    await agentRepo.remove(agent);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
