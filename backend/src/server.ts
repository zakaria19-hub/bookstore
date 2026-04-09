import cors from 'cors';
import { config } from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';
import mongoose from 'mongoose';

import router from './http/routes/index.js';
import { createInMemoryRouter } from './http/routes/inMemory.js';

config();

const app: Express = express();
const port = 9000;
const host = '0.0.0.0';
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

const createApiRouter = async () => {
    const configuredUrl = process.env.MONGO_URL?.trim();
    if (!configuredUrl) {
        console.log('MONGO_URL not set, using in-memory API store');
        return createInMemoryRouter(jwtSecret);
    }

    try {
        await mongoose.connect(configuredUrl, {
            serverSelectionTimeoutMS: 3000,
        });
        console.log(`Mongo connected: ${configuredUrl}`);
        return router;
    } catch (error) {
        console.log(`Mongo connection failed for ${configuredUrl}`);
        console.log(error);
        console.log('Falling back to in-memory API store');
        return createInMemoryRouter(jwtSecret);
    }
};

let apiRouter;
try {
    apiRouter = await createApiRouter();
} catch (error) {
    console.log(error);
    process.exit(1);
}

app.get('/', (_req: Request, res: Response): void => {
    res.status(301).redirect('/api/books');
});

app.use('/api', apiRouter);

app.listen(port, host, () => {
    console.log(`- Local     http://localhost:${port}`);
});
