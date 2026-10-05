import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Property } from '../entities/Property.js';
import { Agent } from '../entities/Agent.js';
import { User } from '../entities/User.js';
import { Inquiry } from '../entities/Inquiry.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';
import { ValuationRequest } from '../entities/ValuationRequest.js';
import { Role } from '../entities/Role.js';

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
    const { page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await userRepo.findAndCount({
      skip,
      take: Number(limit),
      order: { createdAt: 'DESC' },
      relations: { role: true },
    });

    // Filter users to only select specific fields
    const filteredUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isActive: u.isActive,
      canUploadPropertyMedia: u.canUploadPropertyMedia,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      role: u.role ? { id: u.role.id, name: u.role.name } : null,
    }));

    return res.json({
      success: true,
      data: filteredUsers,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
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

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    if (!roleId) return res.status(400).json({ success: false, message: 'roleId is required.' });

    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);

    const role = await roleRepo.findOne({ where: { id: Number(roleId) } });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found.' });

    const existingUser = await userRepo.findOne({ where: { id: String(req.params.id) } });
    if (!existingUser) return res.status(404).json({ success: false, message: 'User not found.' });

    existingUser.roleId = Number(roleId);
    const user = await userRepo.save(existingUser);

    const userWithRole = await userRepo.findOne({
      where: { id: user.id },
      relations: { role: true },
    });

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userWithRole?.role ? { id: userWithRole.role.id, name: userWithRole.role.name } : null,
      },
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Invalid roleId. Role does not exist.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update user role.', error: error.message });
  }
};

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const roles = await roleRepo.find({ order: { name: 'ASC' } });
    return res.json({ success: true, data: roles });
  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch roles.' });
  }
};
