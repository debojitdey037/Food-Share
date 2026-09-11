require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const connectDB = require('./config/db');
const { initExpiryCron } = require('./middleware/expiryMiddleware');

// Import Routes
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodshare';

// Connect Database
connectDB();

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View Engine & Static Files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'foodshare_default_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
  },
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native',
  }),
};

app.use(session(sessionConfig));

// Flash Messages Middleware
app.use(flash());

// Global Variables Middleware (makes session user & flash messages accessible in all EJS templates)
app.use((req, res, next) => {
  res.locals.user = (req.session && req.session.user) ? req.session.user : null;
  res.locals.success_msg = req.flash ? req.flash('success_msg') : [];
  res.locals.error_msg = req.flash ? req.flash('error_msg') : [];
  res.locals.error = req.flash ? req.flash('error') : [];
  next();
});

// Initialize Background Cron Job for Auto Donation Expiry
initExpiryCron();

// Routes Middleware
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/donor', donorRoutes);
app.use('/ngo', ngoRoutes);
app.use('/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found - FoodShare',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send('Server Error. Please refresh or try again later.');
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` FoodShare Web Application running on port ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

module.exports = app;
