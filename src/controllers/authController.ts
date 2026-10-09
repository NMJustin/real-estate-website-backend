import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../lib/typeorm.js';
import { User } from '../entities/User.js';
import { Role } from '../entities/Role.js';
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from '../lib/passwordResetEmail.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const PASSWORD_RESET_RESPONSE = 'If an account exists for that email, password reset instructions will be sent.';

const hashResetToken = (token: string) => createHash('sha256').update(token).digest('hex');

// ─── Admin Login ────────────────────────────────────────────────────────────
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { email: String(email) },
      relations: { role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    // Require admin role
    if (user.role.name.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await userRepo.save(user);

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

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { email: String(email) },
      relations: { role: true },
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

    user.lastLoginAt = new Date();
    await userRepo.save(user);

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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    if (!isPasswordResetEmailConfigured()) {
      return res.status(503).json({ success: false, message: 'Password reset is temporarily unavailable. Please contact an administrator.' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email })
      .getOne();
    if (!user || !user.isActive) {
      return res.json({ success: true, message: PASSWORD_RESET_RESPONSE });
    }

    if (user.passwordResetExpiresAt && user.passwordResetExpiresAt.getTime() > Date.now()) {
      return res.json({ success: true, message: PASSWORD_RESET_RESPONSE });
    }

    const token = randomBytes(32).toString('hex');
    user.passwordResetTokenHash = hashResetToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await userRepo.save(user);

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (error) {
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      await userRepo.save(user);
      console.error('Password reset email delivery failed:', error);
      return res.status(503).json({ success: false, message: 'Password reset email could not be delivered. Please try again later or contact an administrator.' });
    }

    return res.json({ success: true, message: PASSWORD_RESET_RESPONSE });
  } catch (error) {
    console.error('Forgot password request failed:', error);
    return res.status(500).json({ success: false, message: 'Unable to process the password reset request.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ success: false, message: 'This password reset link is invalid or expired.' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { passwordResetTokenHash: hashResetToken(token) },
    });
    if (!user || !user.isActive || !user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: 'This password reset link is invalid or expired.' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await userRepo.save(user);

    return res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Password reset failed:', error);
    return res.status(500).json({ success: false, message: 'Unable to reset the password.' });
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    const existing = await userRepo.findOne({ where: { email: String(email) } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Default to 'user' role (id: 2; seed accordingly)
    const userRole = await roleRepo.findOne({ where: { name: 'user' } });
    if (!userRole) {
      return res.status(500).json({ success: false, message: 'Default role not found. Contact admin.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = userRepo.create({
      name,
      email,
      phone,
      passwordHash,
      roleId: userRole.id,
    });
    const savedUser = await userRepo.save(user);

    const userWithRole = await userRepo.findOne({
      where: { id: savedUser.id },
      relations: { role: true },
    });

    const token = jwt.sign(
      { id: savedUser.id, email: savedUser.email, role: userWithRole?.role.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return res.status(201).json({
      success: true,
      data: { token, user: { id: savedUser.id, name: savedUser.name, email: savedUser.email, role: userWithRole?.role.name } },
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

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        role: {
          name: user.role.name,
        },
      },
    });
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
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    const updatedUser = await userRepo.save(user);

    return res.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
