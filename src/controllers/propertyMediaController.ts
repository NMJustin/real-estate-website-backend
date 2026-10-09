import type { Request, Response } from 'express';
import crypto from 'crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { User } from '../entities/User.js';

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const secretKey = process.env.SUPABASE_SECRET_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageApiKey = secretKey || serviceRoleKey;
const bucket = process.env.SUPABASE_PROPERTY_MEDIA_BUCKET || 'property-media';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']);

export const uploadPropertyMedia = async (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user?.id }, relations: { role: true } });
    const isPropertyManager = user?.role?.name === 'property_manager';
    const canUploadAsAgentOrOwner = Boolean(
      user?.canUploadPropertyMedia && user.role && ['agent', 'property_owner'].includes(user.role.name),
    );
    if (!user || (!isPropertyManager && !canUploadAsAgentOrOwner)) {
      return res.status(403).json({ success: false, message: 'Your account is not permitted to upload property media.' });
    }
  }
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: 'Please choose an image or video file.' });
  if (!supabaseUrl || !storageApiKey) return res.status(500).json({ success: false, message: 'Supabase Storage is not configured.' });
  if (!allowedTypes.has(file.mimetype)) return res.status(400).json({ success: false, message: 'Only JPG, PNG, WebP, GIF, MP4, WebM, and MOV files are allowed.' });

  const extension = file.originalname.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${req.user?.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        ...(!secretKey && serviceRoleKey ? { Authorization: `Bearer ${serviceRoleKey}` } : {}),
        apikey: storageApiKey,
        'Content-Type': file.mimetype,
        'x-upsert': 'false',
      },
      body: new Uint8Array(file.buffer),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase upload failed:', detail);
      return res.status(502).json({ success: false, message: 'Unable to upload media to storage.' });
    }
    return res.status(201).json({
      success: true,
      data: {
        url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`,
        mediaType: file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      },
    });
  } catch (error) {
    console.error('Property media upload failed:', error);
    return res.status(502).json({ success: false, message: 'Unable to reach Supabase Storage.' });
  }
};
