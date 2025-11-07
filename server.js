const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with explicit MIME types
app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
    }
}));

// Simple session (in-memory for now)
app.use(session({
    secret: process.env.SESSION_SECRET || 'quicklinks-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// In-memory storage
let users = [];
let urls = [];
let clicks = [];

// Create admin user on startup
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@quicklinks.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

users.push({
    id: 1,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: 'Admin',
    role: 'admin',
    plan: 'unlimited',
    trialEnds: null,
    createdAt: new Date().toISOString()
});

console.log('✓ Admin user created');
console.log('Email:', ADMIN_EMAIL);
console.log('Password:', ADMIN_PASSWORD);

// Helper functions
function generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function findUser(email, password) {
    return users.find(u => u.email === email && u.password === password);
}

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
}

function isAdmin(req, res, next) {
    if (req.session.userId && req.session.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}

// Auth Routes
app.post('/api/auth/signup', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 30);

    const user = {
        id: users.length + 1,
        email,
        password,
        name,
        role: 'user',
        plan: 'free',
        trialEnds: trialEnds.toISOString(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    users.push(user);

    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;

    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            trialDays: 30
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const user = findUser(email, password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date().toISOString();

    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;

    const trialEnd = new Date(user.trialEnds);
    const now = new Date();
    const daysLeft = user.trialEnds ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : null;

    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.plan,
            trial: {
                active: daysLeft > 0,
                expired: daysLeft <= 0,
                daysLeft: daysLeft > 0 ? daysLeft : 0
            }
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/auth/me', isAuthenticated, (req, res) => {
    const user = users.find(u => u.id === req.session.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const trialEnd = new Date(user.trialEnds);
    const now = new Date();
    const daysLeft = user.trialEnds ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : null;

    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        trial: {
            active: daysLeft > 0,
            expired: daysLeft <= 0,
            daysLeft: daysLeft > 0 ? daysLeft : 0
        },
        createdAt: user.createdAt
    });
});

// URL Routes
app.post('/api/shorten', isAuthenticated, (req, res) => {
    const { longUrl } = req.body;
    const userId = req.session.userId;

    if (!longUrl) {
        return res.status(400).json({ error: 'URL required' });
    }

    const user = users.find(u => u.id === userId);
    const userUrls = urls.filter(u => u.userId === userId);

    if (user.plan === 'free' && userUrls.length >= 3) {
        const trialEnd = new Date(user.trialEnds);
        const now = new Date();
        if (trialEnd <= now) {
            return res.status(403).json({ error: 'Trial expired. Please upgrade.' });
        }
        return res.status(403).json({ error: 'Free plan limit reached. Upgrade for unlimited URLs.' });
    }

    const shortCode = generateShortCode();
    const baseUrl = process.env.BASE_URL || process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `http://localhost:${PORT}`;

    const url = {
        id: urls.length + 1,
        userId,
        longUrl,
        shortCode,
        shortUrl: `${baseUrl}/${shortCode}`,
        createdAt: new Date().toISOString(),
        clicks: 0,
        uniqueVisitors: 0
    };

    urls.push(url);

    res.json({
        success: true,
        data: url
    });
});

app.get('/api/urls', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const userUrls = urls.filter(u => u.userId === userId);

    const urlsWithStats = userUrls.map(url => {
        const urlClicks = clicks.filter(c => c.urlId === url.id);
        const uniqueIPs = [...new Set(urlClicks.map(c => c.ip))];

        return {
            ...url,
            clicks: urlClicks.length,
            uniqueVisitors: uniqueIPs.length
        };
    });

    res.json({ success: true, data: urlsWithStats });
});

app.delete('/api/urls/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    const index = urls.findIndex(u => u.id == id && u.userId === userId);

    if (index === -1) {
        return res.status(404).json({ error: 'URL not found' });
    }

    urls.splice(index, 1);
    res.json({ success: true });
});

// Admin Routes
app.get('/api/admin/stats', isAdmin, (req, res) => {
    const totalUsers = users.filter(u => u.role !== 'admin').length;
    const paidUsers = users.filter(u => u.plan === 'pro' || u.plan === 'business').length;
    const totalUrls = urls.length;
    const totalClicks = clicks.length;

    const today = new Date().toDateString();
    const newUsersToday = users.filter(u => 
        new Date(u.createdAt).toDateString() === today
    ).length;

    const mrr = paidUsers * 9;

    res.json({
        success: true,
        data: {
            totalUsers,
            paidUsers,
            totalUrls,
            totalClicks,
            newUsersToday,
            mrr
        }
    });
});

app.get('/api/admin/users', isAdmin, (req, res) => {
    const usersWithStats = users
        .filter(u => u.role !== 'admin')
        .map(user => {
            const userUrls = urls.filter(u => u.userId === user.id);
            const userClicks = clicks.filter(c => {
                const url = urls.find(u => u.id === c.urlId);
                return url && url.userId === user.id;
            });

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                plan: user.plan,
                trial_ends: user.trialEnds,
                created_at: user.createdAt,
                last_login: user.lastLogin,
                total_urls: userUrls.length,
                total_clicks: userClicks.length
            };
        });

    res.json({ success: true, data: usersWithStats });
});

app.get('/api/admin/urls', isAdmin, (req, res) => {
    const urlsWithUsers = urls.map(url => {
        const user = users.find(u => u.id === url.userId);
        const urlClicks = clicks.filter(c => c.urlId === url.id);

        return {
            id: url.id,
            long_url: url.longUrl,
            short_code: url.shortCode,
            shortUrl: url.shortUrl,
            created_at: url.createdAt,
            user_email: user ? user.email : 'Unknown',
            clicks: urlClicks.length
        };
    });

    res.json({ success: true, data: urlsWithUsers });
});

app.put('/api/admin/users/:id/plan', isAdmin, (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;

    const user = users.find(u => u.id == id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.plan = plan;
    res.json({ success: true });
});

// Redirect Route - must come before page routes
app.get('/:shortCode', (req, res, next) => {
    const { shortCode } = req.params;

    // Skip if it's a page route
    if (['login', 'signup', 'dashboard', 'admin', 'pricing', 'features'].includes(shortCode)) {
        return next();
    }

    const url = urls.find(u => u.shortCode === shortCode);

    if (!url) {
        return res.status(404).send('URL not found');
    }

    // Log click
    clicks.push({
        id: clicks.length + 1,
        urlId: url.id,
        clickedAt: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        referrer: req.get('referrer')
    });

    res.redirect(301, url.longUrl);
});

// Serve pages with explicit Content-Type headers
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

app.get('/login', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.redirect('/login');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        users: users.length,
        urls: urls.length,
        clicks: clicks.length
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║   QuickLinks Server Running! 🚀       ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                        
║   Admin Email: ${ADMIN_EMAIL}
║   Admin Password: ${ADMIN_PASSWORD}
║                                        ║
║   ✓ Server is healthy                 ║
║   ✓ Ready to accept requests          ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;
