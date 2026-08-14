const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// ===== ALL SECRETS AND URLS ARE HERE (NOT IN APP) =====
const CONFIG = {
    PASTEBIN_URL: 'https://pastebin.com/raw/ZEuXzKfS',
    KEY_API: 'https://key-system-production-1bc5.up.railway.app',
    MASTER_KEY: 'HEXPROXY999',
    MASTER_KEY_EXPIRY: '2026-12-31T23:59:59.000000'
};

// ===== APP CALLS THIS TO GET CONFIG =====
app.get('/api/config', async (req, res) => {
    try {
        const response = await axios.get(CONFIG.PASTEBIN_URL);
        const config = response.data;
        
        // Add master key from server (hidden from app)
        config.master_key = CONFIG.MASTER_KEY;
        config.master_key_expiry = CONFIG.MASTER_KEY_EXPIRY;
        
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

// ===== APP CALLS THIS FOR LOGIN =====
app.post('/api/login', async (req, res) => {
    try {
        const response = await axios.post(CONFIG.KEY_API + '/api/login', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// ===== APP CALLS THIS FOR ACTIVATION =====
app.post('/api/activate', async (req, res) => {
    try {
        const response = await axios.post(CONFIG.KEY_API + '/api/activate', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Activation failed' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
