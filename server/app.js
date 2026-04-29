import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { logVisit, getLogs, getStats } from './controllers/visit.controller.js';
import { login, logout } from './controllers/auth.controller.js';
import { requireAuth } from './middleware/auth.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ip-recorder-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/v', logVisit);

app.get('/api/logs', requireAuth, getLogs);
app.get('/api/stats', requireAuth, getStats);

app.post('/api/login', login);
app.post('/api/logout', logout);

app.get('/admin/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}/`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});

export default app;
