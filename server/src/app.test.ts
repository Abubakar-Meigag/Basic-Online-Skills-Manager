import request from 'supertest';
import app from './app';

describe('App', () => {
      it('GET / returns the welcome message', async () => {
            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.text).toContain('Welcome to Basic Online Skills Manager');
      });

      it('GET /health returns ok:true', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                  ok: true,
                  message: 'Server is healthy',
            });
      });

      it('GET /unknown-route returns 404', async () => {
            const response = await request(app).get('/definitely-does-not-exist');

            expect(response.status).toBe(404);
      });
});