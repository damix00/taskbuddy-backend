import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import logger from './middleware/logger';
import cluster from 'cluster';
import os from 'os';
import * as connection from './database/connection';
import userAgent from './middleware/user_agent';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 9500;

app.use(cors({
    origin: '*'
}));
app.use(logger);
app.use(express.json());
app.disable('etag'); // Disable 304 responses
// @ts-ignore
app.use(userAgent); // add user agent to request

for (const route of routes) {
    app.use(route.path, route.handler);
}

app.all('*', (req, res) => {
    res.status(404).json({
        message: 'Not Found'
    });
});

async function start() {
    console.log('Connecting to database');
    await connection.connect();
    console.log('Connected to database');

    app.listen(PORT, () => {
        console.log(`Server is running in http://localhost:${PORT}`);
    });
}

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
}
else {
    start();
}