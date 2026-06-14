require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/teams', require('./routes/team.routes'));
app.use('/api/supervisors', require('./routes/supervisor.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/files', require('./routes/file.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

app.get('/', (_req, res) => res.json({ ok: true, name: 'Graduation Hub API', version: '2.0.0' }));

app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}).catch((e) => { console.error('DB error', e); process.exit(1); });
