import dotenv from 'dotenv';

dotenv.config({ override: true });

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
};
