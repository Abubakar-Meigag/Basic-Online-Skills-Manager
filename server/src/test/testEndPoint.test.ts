import request from 'supertest';
import app from '../app';
import pool from '../data/connection';

vi.mock('../data/connection', () => ({
      default: { query: vi.fn() },
}));

describe('GET /test', () => {
      afterEach(() => {
            vi.clearAllMocks();
      });

      it('returns "No users found" when db is empty', async () => {
            (pool.query as any).mockResolvedValueOnce({ rows: [] });

            const response = await request(app).get('/test');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'No users found' });
      });

      it('returns the users when db has rows', async () => {
            const mockUsers = [{ id: '1', email: 'test@example.com' }];
            (pool.query as any).mockResolvedValueOnce({ rows: mockUsers });

            const response = await request(app).get('/test');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
      });

      it('returns JSON content-type', async () => {
            (pool.query as any).mockResolvedValueOnce({ rows: [] });

            const response = await request(app).get('/test');

            expect(response.headers['content-type']).toMatch(/application\/json/);
      });
});
