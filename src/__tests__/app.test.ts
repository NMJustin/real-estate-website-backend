import request from 'supertest';
import { app } from '../app.js';

describe('API Health Check', () => {
  it('should return success message for root endpoint', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');

    expect(response.status).toBe(404);
  });
});
