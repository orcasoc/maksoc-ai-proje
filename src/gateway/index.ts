import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from '../middleware/auth';
import { complianceLogger, logger } from '../middleware/logger';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(complianceLogger);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Mock Auth Endpoint to get a token (for testing purposes)
import jwt from 'jsonwebtoken';
app.post('/auth/login', (req: Request, res: Response) => {
    // Verify credentials against DB/LDAP in real scenario
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

// Middleware for protected routes
app.use('/mcp', authMiddleware);

// Proxy Logic
const proxyRequest = async (serviceUrl: string, req: Request, res: Response) => {
    try {
        const url = `${serviceUrl}${req.path.replace('/mcp', '')}`;
        // e.g. /mcp/wazuh/events -> http://wazuh-mcp:3000/wazuh/events
        // We need to strip the service prefix if the adapter expects root paths, 
        // or keep it if it handles routing. Let's assume adapters handle specific paths.

        // Better Routing Strategy:
        // /mcp/wazuh/* -> http://wazuh-mcp:3000/*
        // /mcp/misp/* -> http://misp-mcp:3000/*

        // Construct target URL
        // req.baseUrl is /mcp
        // req.path is /wazuh/events
        // We want to forward /events to wazuh-mcp if the path is /mcp/wazuh/events

        logger.info(`Proxying to: ${serviceUrl}`);

        const response = await axios({
            method: req.method,
            url: serviceUrl, // We'll pass the exact full URL constructed in the route handler
            data: req.body,
            params: req.query,
            headers: {
                'Content-Type': 'application/json',
                // Propagate Auth or inject service-to-service auth if needed
            }
        });

        res.status(response.status).json(response.data);
    } catch (error: any) {
        logger.error(`Proxy Error: ${error.message}`);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(502).json({ error: 'Bad Gateway' });
        }
    }
};

// Routes
const WAZUH_URL = process.env.WAZUH_MCP_URL || 'http://localhost:3001';
const MISP_URL = process.env.MISP_MCP_URL || 'http://localhost:3002';
const SHUFFLE_URL = process.env.SHUFFLE_MCP_URL || 'http://localhost:3003';
const DFIR_IRIS_URL = process.env.DFIR_IRIS_MCP_URL || 'http://localhost:3004';

app.use('/mcp/wazuh/*', (req, res) => {
    const targetPath = req.originalUrl.replace('/mcp/wazuh', ''); // /events
    proxyRequest(`${WAZUH_URL}${targetPath}`, req, res);
});

app.use('/mcp/misp/*', (req, res) => {
    const targetPath = req.originalUrl.replace('/mcp/misp', '');
    proxyRequest(`${MISP_URL}${targetPath}`, req, res);
});

app.use('/mcp/shuffle/*', (req, res) => {
    const targetPath = req.originalUrl.replace('/mcp/shuffle', '');
    proxyRequest(`${SHUFFLE_URL}${targetPath}`, req, res);
});

app.use('/mcp/dfir-iris/*', (req, res) => {
    const targetPath = req.originalUrl.replace('/mcp/dfir-iris', '');
    proxyRequest(`${DFIR_IRIS_URL}${targetPath}`, req, res);
});

app.listen(PORT, () => {
    logger.info(`Gateway running on port ${PORT}`);
});
