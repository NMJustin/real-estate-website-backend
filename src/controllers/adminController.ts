import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboard = async (_req: Request, res: Response) => {
  try {
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
      prisma.property.count(),
      prisma.property.count({ where: { publicationStatus: 'PUBLISHED', status: 'AVAILABLE' } }),
      prisma.agent.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count(),
      prisma.viewingRequest.count({ where: { status: 'PENDING' } }),
      prisma.viewingRequest.count(),
      prisma.valuationRequest.count({ where: { status: 'PENDING' } }),
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, propertyType: true, transactionType: true,
          price: true, currency: true, status: true, publicationStatus: true,
          createdAt: true,
          agent: { select: { name: true } },
        },
      }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, phone: true, message: true,
          status: true, createdAt: true,
          property: { select: { title: true, slug: true } },
        },
      }),
    ]);

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
        recentProperties,
        recentInquiries,
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
    const { page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, phone: true,
          isActive: true, createdAt: true, lastLoginAt: true,
          role: { select: { name: true } },
        },
      }),
      prisma.user.count(),
    ]);

    return res.json({
      success: true,
      data: users,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};
