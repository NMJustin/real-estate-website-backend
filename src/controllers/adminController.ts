import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../lib/typeorm.js';
import { Property } from '../entities/Property.js';
import { Agent } from '../entities/Agent.js';
import { User } from '../entities/User.js';
import { Inquiry } from '../entities/Inquiry.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';
import { ValuationRequest } from '../entities/ValuationRequest.js';
import { Role } from '../entities/Role.js';

const normalizedRoleName = (name: string) => name.trim().toLowerCase();

const uniqueRoles = (roles: Role[]) => {
  const byName = new Map<string, Role>();
  for (const role of roles) {
    const normalizedName = normalizedRoleName(role.name);
    const existing = byName.get(normalizedName);
    if (!existing || (role.name === normalizedName && existing.name !== normalizedName)) {
      byName.set(normalizedName, { ...role, name: normalizedName });
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
};

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'agent';

const saveAgentProfile = async (
  manager: typeof AppDataSource.manager,
  user: User,
  profile: Record<string, unknown> | undefined,
) => {
  const agentRepo = manager.getRepository(Agent);
  let agent = await agentRepo.findOne({ where: { userId: user.id } });
  const data = profile || {};
  const desiredName = typeof data.name === 'string' && data.name.trim() ? data.name.trim() : user.name || user.email;
  const baseSlug = slugify(typeof data.slug === 'string' && data.slug.trim() ? data.slug : desiredName);
  let slug = baseSlug;
  let suffix = 2;
  while (await agentRepo.createQueryBuilder('agent')
    .where('agent.slug = :slug', { slug })
    .andWhere(agent ? 'agent.id != :id' : '1=1', agent ? { id: agent.id } : {})
    .getOne()) {
    slug = `${baseSlug}-${suffix++}`;
  }

  if (!agent) {
    agent = agentRepo.create({
      id: randomUUID(),
      userId: user.id,
      name: desiredName,
      slug,
      email: user.email,
      phone: user.phone,
    });
  } else {
    agent.name = desiredName;
    agent.slug = slug;
    agent.email = user.email;
    agent.phone = user.phone;
  }

  const stringFields = ['profileImage', 'bio', 'specialization', 'licenseNumber'] as const;
  for (const field of stringFields) {
    if (typeof data[field] === 'string') agent[field] = data[field] as string;
  }
  if (data.yearsExperience !== undefined) {
    const years = Number(data.yearsExperience);
    if (!Number.isInteger(years) || years < 0 || years > 100) {
      throw new Error('Years of experience must be a whole number between 0 and 100.');
    }
    agent.yearsExperience = years;
  }
  if (typeof data.isActive === 'boolean') agent.isActive = data.isActive;
  return agentRepo.save(agent);
};

const userResponse = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  isActive: user.isActive,
  canUploadPropertyMedia: user.canUploadPropertyMedia,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
  role: user.role ? { id: user.role.id, name: normalizedRoleName(user.role.name) } : null,
  agentProfile: user.agent?.[0] ? {
    name: user.agent[0].name,
    slug: user.agent[0].slug,
    profileImage: user.agent[0].profileImage || '',
    bio: user.agent[0].bio || '',
    specialization: user.agent[0].specialization || '',
    licenseNumber: user.agent[0].licenseNumber || '',
    yearsExperience: user.agent[0].yearsExperience ?? '',
    isActive: user.agent[0].isActive,
  } : null,
});

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const agentRepo = AppDataSource.getRepository(Agent);
    const userRepo = AppDataSource.getRepository(User);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const valuationRepo = AppDataSource.getRepository(ValuationRequest);

    const [
      totalProperties,
      publishedProperties,
      totalAgents,
      totalUsers,
      pendingInquiries,
      totalInquiries,
      pendingViewings,
      totalViewings,
      pendingValuations,
      recentProperties,
      recentInquiries,
    ] = await Promise.all([
      propertyRepo.count(),
      propertyRepo.count({ where: { publicationStatus: 'PUBLISHED', status: 'AVAILABLE' } }),
      agentRepo.count({ where: { isActive: true } }),
      userRepo.count({ where: { isActive: true } }),
      inquiryRepo.count({ where: { status: 'PENDING' } }),
      inquiryRepo.count(),
      viewingRepo.count({ where: { status: 'PENDING' } }),
      viewingRepo.count(),
      valuationRepo.count({ where: { status: 'PENDING' } }),
      propertyRepo.find({
        take: 5,
        order: { createdAt: 'DESC' },
        relations: { agent: true },
      }),
      inquiryRepo.find({
        take: 5,
        order: { createdAt: 'DESC' },
        relations: { property: true },
      }),
    ]);

    // Filter recentProperties to only select specific fields
    const filteredRecentProperties = recentProperties.map(p => ({
      id: p.id,
      title: p.title,
      propertyType: p.propertyType,
      transactionType: p.transactionType,
      price: p.price,
      currency: p.currency,
      status: p.status,
      publicationStatus: p.publicationStatus,
      createdAt: p.createdAt,
      agent: p.agent ? { name: p.agent.name } : null,
    }));

    // Filter recentInquiries to only select specific fields
    const filteredRecentInquiries = recentInquiries.map(i => ({
      id: i.id,
      name: i.name,
      email: i.email,
      phone: i.phone,
      message: i.message,
      status: i.status,
      createdAt: i.createdAt,
      property: i.property ? { title: i.property.title, slug: i.property.slug } : null,
    }));

    return res.json({
      success: true,
      data: {
        stats: {
          totalProperties,
          publishedProperties,
          totalAgents,
          totalUsers,
          pendingInquiries,
          totalInquiries,
          pendingViewings,
          totalViewings,
          pendingValuations,
        },
        recentProperties: filteredRecentProperties,
        recentInquiries: filteredRecentInquiries,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard data.' });
  }
};

// ─── Users List ───────────────────────────────────────────────────────────────
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const [users, total] = await userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { role: true, agent: true },
    });

    const roles = uniqueRoles(await AppDataSource.getRepository(Role).find());
    const canonicalRoles = new Map(roles.map((role) => [normalizedRoleName(role.name), role]));
    const filteredUsers = users.map((user) => {
      const mapped = userResponse(user);
      const canonicalRole = user.role ? canonicalRoles.get(normalizedRoleName(user.role.name)) : undefined;
      return { ...mapped, role: canonicalRole ? { id: canonicalRole.id, name: canonicalRole.name } : null };
    });

    return res.json({
      success: true,
      data: filteredUsers,
      meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, phone, password, roleId, canUploadPropertyMedia, agentProfile } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const parsedRoleId = Number(roleId);
  if (!normalizedName || !normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'A name and valid email address are required.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });
  }
  if (!Number.isInteger(parsedRoleId) || parsedRoleId < 1) {
    return res.status(400).json({ success: false, message: 'Select a valid role.' });
  }
  if (phone !== undefined && phone !== null && typeof phone !== 'string') {
    return res.status(400).json({ success: false, message: 'Phone must be text.' });
  }
  if (canUploadPropertyMedia !== undefined && typeof canUploadPropertyMedia !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Media upload permission must be true or false.' });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const role = await queryRunner.manager.getRepository(Role).findOne({ where: { id: parsedRoleId } });
    if (!role) {
      await queryRunner.rollbackTransaction();
      return res.status(400).json({ success: false, message: 'Selected role does not exist.' });
    }
    const duplicate = await queryRunner.manager.getRepository(User)
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();
    if (duplicate) {
      await queryRunner.rollbackTransaction();
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const userRepo = queryRunner.manager.getRepository(User);
    const user = userRepo.create({
      id: randomUUID(),
      name: normalizedName,
      email: normalizedEmail,
      phone: typeof phone === 'string' && phone.trim() ? phone.trim() : undefined,
      passwordHash: await bcrypt.hash(password, 12),
      roleId: role.id,
      isActive: true,
      canUploadPropertyMedia: canUploadPropertyMedia === true,
    });
    await userRepo.save(user);
    if (normalizedRoleName(role.name) === 'agent') await saveAgentProfile(queryRunner.manager, user, agentProfile);
    await queryRunner.commitTransaction();

    const savedUser = await AppDataSource.getRepository(User).findOne({
      where: { id: user.id },
      relations: { role: true, agent: true },
    });
    return res.status(201).json({ success: true, data: savedUser ? userResponse(savedUser) : null });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error && error.message.startsWith('Years of experience')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create user failed:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  } finally {
    await queryRunner.release();
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { name, email, phone, password, roleId, isActive, canUploadPropertyMedia, agentProfile } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
  if (normalizedEmail !== undefined && (!normalizedEmail || normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
  }
  if (password !== undefined && (typeof password !== 'string' || password.length < 8 || password.length > 128)) {
    return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Active status must be true or false.' });
  }
  if (canUploadPropertyMedia !== undefined && typeof canUploadPropertyMedia !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Media upload permission must be true or false.' });
  }
  if (phone !== undefined && phone !== null && typeof phone !== 'string') {
    return res.status(400).json({ success: false, message: 'Phone must be text.' });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const userRepo = queryRunner.manager.getRepository(User);
    const user = await userRepo.findOne({ where: { id }, relations: { role: true, agent: true } });
    if (!user) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (normalizedEmail !== undefined && normalizedEmail !== user.email.toLowerCase()) {
      const duplicate = await userRepo.createQueryBuilder('user')
        .where('LOWER(user.email) = :email', { email: normalizedEmail })
        .andWhere('user.id != :id', { id })
        .getOne();
      if (duplicate) {
        await queryRunner.rollbackTransaction();
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
    }

    let selectedRole = user.role;
    if (roleId !== undefined) {
      const parsedRoleId = Number(roleId);
      if (!Number.isInteger(parsedRoleId) || parsedRoleId < 1) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ success: false, message: 'Select a valid role.' });
      }
      const role = await queryRunner.manager.getRepository(Role).findOne({ where: { id: parsedRoleId } });
      if (!role) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ success: false, message: 'Selected role does not exist.' });
      }
      if (user.id === req.user?.id && (normalizedRoleName(role.name) !== 'admin' || isActive === false)) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ success: false, message: 'You cannot remove administrator access or deactivate your own account.' });
      }
      user.roleId = role.id;
      selectedRole = role;
    }
    if (user.id === req.user?.id && isActive === false) {
      await queryRunner.rollbackTransaction();
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    if (name !== undefined) user.name = name.trim();
    if (normalizedEmail !== undefined) user.email = normalizedEmail;
    if (phone !== undefined) user.phone = phone?.trim() || undefined;
    if (password !== undefined) user.passwordHash = await bcrypt.hash(password, 12);
    if (isActive !== undefined) user.isActive = isActive;
    if (canUploadPropertyMedia !== undefined) user.canUploadPropertyMedia = canUploadPropertyMedia;
    await userRepo.save(user);
    if (normalizedRoleName(selectedRole.name) === 'agent') await saveAgentProfile(queryRunner.manager, user, agentProfile);

    await queryRunner.commitTransaction();
    const updated = await AppDataSource.getRepository(User).findOne({
      where: { id },
      relations: { role: true, agent: true },
    });
    return res.json({ success: true, data: updated ? userResponse(updated) : null });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error && error.message.startsWith('Years of experience')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update user failed:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  } finally {
    await queryRunner.release();
  }
};

export const updateUserMediaPermission = async (req: Request, res: Response) => {
  const enabled = req.body?.canUploadPropertyMedia;
  if (typeof enabled !== 'boolean') return res.status(400).json({ success: false, message: 'canUploadPropertyMedia must be true or false.' });
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: String(req.params.id) }, relations: { role: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (!user.role || !['agent', 'property_owner'].includes(user.role.name)) return res.status(400).json({ success: false, message: 'Only agents and property owners can receive media upload permission.' });
    user.canUploadPropertyMedia = enabled;
    const updated = await userRepo.save(user);
    return res.json({ success: true, data: { id: updated.id, canUploadPropertyMedia: updated.canUploadPropertyMedia } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update media upload permission.' });
  }
};

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const roles = uniqueRoles(await roleRepo.find({ order: { name: 'ASC' } }));
    return res.json({ success: true, data: roles });
  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch roles.' });
  }
};

export const getAssignablePropertyManagers = async (_req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    const propertyManagerRole = await roleRepo.findOne({
      where: { name: 'property_manager' },
    });

    if (!propertyManagerRole) {
      return res.json({ success: true, data: [] });
    }

    const propertyManagers = await userRepo.find({
      where: {
        roleId: propertyManagerRole.id,
        isActive: true,
      },
      relations: { role: true },
      order: { name: 'ASC' },
    });

    const filteredManagers = propertyManagers.map((manager) => ({
      id: manager.id,
      name: manager.name || manager.email,
      email: manager.email,
      role: manager.role ? { name: normalizedRoleName(manager.role.name) } : null,
    }));

    return res.json({ success: true, data: filteredManagers });
  } catch (error) {
    console.error('Get assignable property managers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch property managers.' });
  }
};
