const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// ===== ALL SECRETS AND URLS ARE HERE =====
const CONFIG = {
    PASTEBIN_URL: 'https://pastebin.com/raw/ZEuXzKfS',
    KEY_API: 'https://key-system-production-1bc5.up.railway.app',
    MASTER_KEY: 'HEXPROXY999',
    MASTER_KEY_EXPIRY: '2026-12-31T23:59:59.000000',
    
    // Asset URLs
    ASSETS: {
        bg_video: 'https://github.com/madangowdru17-star/Assistant/raw/refs/heads/main/bg.mp4',
        ff_drag: 'https://raw.githubusercontent.com/madangowdru17-star/Assistant/refs/heads/main/localconfig.json',
        ff_antenna: 'https://raw.githubusercontent.com/madangowdru17-star/Assistant/refs/heads/main/localconfig.json',
        max_drag_safe: 'https://raw.githubusercontent.com/madangowdru17-star/DARG-HS-1000/refs/heads/main/localconfig.json',
        max_nick: 'https://raw.githubusercontent.com/madangowdru17-star/DARG-HS-1000/refs/heads/main/localconfig.json',
        update_apk: 'https://github.com/madangowdru17-star/Apk/raw/refs/heads/main/generated_sign.apk'
    }
};

// ===== SECURITY: Only allow requests from your app =====
function isFromApp(req) {
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';
    
    const isAndroid = userAgent.includes('Android') || userAgent.includes('okhttp');
    const isHexApp = referer.includes('hex.com') || 
                     origin.includes('hex.com') ||
                     req.headers['x-app-package'] === 'hex.com';
    
    return isAndroid && isHexApp;
}

// ===== BLOCK BROWSER ACCESS =====
app.use('/api/*', (req, res, next) => {
    if (!isFromApp(req)) {
        return res.status(200).json({ 
            error: 'Access denied',
            message: 'This endpoint is only accessible from the HEX PROXY application'
        });
    }
    next();
});

// ===== 1. GET CONFIG (App calls this) =====
app.get('/api/config', async (req, res) => {
    try {
        console.log('Fetching config from Pastebin...');
        const response = await axios.get(CONFIG.PASTEBIN_URL);
        const config = response.data;
        
        // Add master key from server
        config.master_key = CONFIG.MASTER_KEY;
        config.master_key_expiry = CONFIG.MASTER_KEY_EXPIRY;
        
        // Replace all URLs with proxy endpoints
        config.api_base_url = 'https://hex-proxy-api.onrender.com';
        config.update_url = '/api/proxy/update';
        config.ff_drag_url = '/api/proxy/ff_drag';
        config.ff_antenna_url = '/api/proxy/ff_antenna';
        config.max_drag_safe_url = '/api/proxy/max_drag_safe';
        config.max_nick_url = '/api/proxy/max_nick';
        config.max_body_url = '';
        
        // Replace asset URLs with proxy
        if (config.assets) {
            config.assets = config.assets.map(asset => {
                if (asset.name === 'bg.mp4') {
                    return { ...asset, url: '/api/proxy/bg_video' };
                }
                return asset;
            });
        }
        
        console.log('Config sent successfully');
        res.json(config);
    } catch (error) {
        console.error('Config fetch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

// ===== 2. PROXY FOR ASSETS =====
app.get('/api/proxy/bg_video', async (req, res) => {
    try {
        console.log('Proxying bg.mp4...');
        const response = await axios({
            method: 'get',
            url: CONFIG.ASSETS.bg_video,
            responseType: 'stream',
            timeout: 60000
        });
        
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename="bg.mp4"');
        response.data.pipe(res);
    } catch (error) {
        console.error('bg.mp4 proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// ===== 3. PROXY FOR CONFIG FILES =====
app.get('/api/proxy/ff_drag', async (req, res) => {
    try {
        console.log('Proxying ff_drag config...');
        const response = await axios.get(CONFIG.ASSETS.ff_drag);
        res.json(response.data);
    } catch (error) {
        console.error('ff_drag proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

app.get('/api/proxy/ff_antenna', async (req, res) => {
    try {
        console.log('Proxying ff_antenna config...');
        const response = await axios.get(CONFIG.ASSETS.ff_antenna);
        res.json(response.data);
    } catch (error) {
        console.error('ff_antenna proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

app.get('/api/proxy/max_drag_safe', async (req, res) => {
    try {
        console.log('Proxying max_drag_safe config...');
        const response = await axios.get(CONFIG.ASSETS.max_drag_safe);
        res.json(response.data);
    } catch (error) {
        console.error('max_drag_safe proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

app.get('/api/proxy/max_nick', async (req, res) => {
    try {
        console.log('Proxying max_nick config...');
        const response = await axios.get(CONFIG.ASSETS.max_nick);
        res.json(response.data);
    } catch (error) {
        console.error('max_nick proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

// ===== 4. PROXY FOR UPDATE APK =====
app.get('/api/proxy/update', async (req, res) => {
    try {
        console.log('Proxying update APK...');
        const response = await axios({
            method: 'get',
            url: CONFIG.ASSETS.update_apk,
            responseType: 'stream',
            timeout: 120000
        });
        
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="app_update.apk"');
        response.data.pipe(res);
    } catch (error) {
        console.error('Update proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch update' });
    }
});

// ===== 5. KEY SYSTEM PROXY =====
app.post('/api/login', async (req, res) => {
    try {
        console.log('Proxying login request...');
        const response = await axios.post(CONFIG.KEY_API + '/api/login', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Login proxy error:', error.message);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

app.post('/api/activate', async (req, res) => {
    try {
        console.log('Proxying activate request...');
        const response = await axios.post(CONFIG.KEY_API + '/api/activate', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Activate proxy error:', error.message);
        res.status(500).json({ success: false, message: 'Activation failed' });
    }
});

// ===== 6. HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Config URL: https://hex-proxy-api.onrender.com/api/config`);
});
