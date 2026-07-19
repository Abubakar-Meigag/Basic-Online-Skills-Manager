import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
      res.send('Welcome to Basic Online Skills Manager');
});

app.get('/health', (_req: Request, res: Response) => {
      res.json({ ok: true, message: 'Server is healthy' });
});
//don't change anything above this line, you can add your endpoints below this line


// Import your endpoint handlers here and define your routes after

import testEndPoint from './api/testEndPoint';
app.get('/test', testEndPoint);



export default app;