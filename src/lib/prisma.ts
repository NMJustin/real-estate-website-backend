import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ override: true });

export const prisma = new PrismaClient();

export default prisma;