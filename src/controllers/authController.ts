import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── Admin Login ────────────────────────────────────────────────────────────
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user with their role
    const user = await prisma.user.findUnique({
      where: { email: String(email) },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    // Require admin role
    if (user.role.name !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Public Login ────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email) },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const passwordValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return res.json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role.name } },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: String(email) } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Default to 'user' role (id: 2; seed accordingly)
    const userRole = await prisma.role.findFirst({ where: { name: 'user' } });
    if (!userRole) {
      return res.status(500).json({ success: false, message: 'Default role not found. Contact admin.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, roleId: userRole.id },
      include: { role: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return res.status(201).json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role.name } },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = (_req: Request, res: Response) => {
  // JWT is stateless — client discards token. We just confirm.
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true, role: { select: { name: true } } },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true },
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
