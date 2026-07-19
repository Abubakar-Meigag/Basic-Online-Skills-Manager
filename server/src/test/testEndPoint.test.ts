import request from 'supertest';
import app from '../app';

describe('GET /test', () => {
      it('returns the "no messages found" message when db is empty', async () => {
            const response = await request(app).get('/test');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ message: 'Hello, World!' }]);
      });

      it('returns JSON content-type', async () => {
            const response = await request(app).get('/test');

            expect(response.headers['content-type']).toMatch(/application\/json/);
      });
});