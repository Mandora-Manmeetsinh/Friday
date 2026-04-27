/* eslint-env node */
import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import process from 'process';
import { executeAutomation } from './automation.js';

config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(json());

// Main execution endpoint
app.post('/execute', async (req, res) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).json({ success: false, message: 'No command provided.' });
    }

    console.log(`[SYS] Received command: ${JSON.stringify(command)}`);

    try {
        const result = await executeAutomation(command);
        res.status(200).json(result);
    } catch (error) {
        console.error('[ERR] Execution failed:', error);
        res.status(500).json({ success: false, message: 'Internal server error during automation.' });
    }
});

app.listen(PORT, () => {
    console.log(`[SYS] FRIDAY Backend Online at http://localhost:${PORT}`);
});
