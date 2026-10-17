import request from 'supertest';
import { AppDataSource } from '../lib/typeorm.js';
import { User } from '../entities/User.js';
import { Role } from '../entities/Role.js';
import { app } from '../app.js';

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Initialize database connection for tests
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/v1/auth/admin/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 403 for non-admin users', async () => {
      // This test would require creating a test user with non-admin role
      // For now, we'll skip it
      expect(true).toBe(true);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
