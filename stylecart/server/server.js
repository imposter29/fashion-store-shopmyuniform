const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from the repo-root .env before anything else.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// One or more allowed browser origins (comma-separated), e.g. the Vercel
// production URL plus any preview URLs. Defaults to the Vite dev server.
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Trust the reverse proxy (Render/Railway/etc.) so secure cookies and the
// real client IP (used by the rate limiter) are handled correctly.
if (isProd) {
  app.set('trust proxy', 1);
}

// Security headers. CSP is disabled because the storefront loads remote
// images (Unsplash) and Google Fonts; enable + configure it if you later
// self-host those assets.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS with credentials so the cross-origin frontend (Vercel) can send the
// auth cookie to the API (Render). Requests with no Origin (curl, health
// checks, server-to-server) are allowed through.
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Optionally serve the built client. Only kicks in when a client build is
// present next to the API (single-service deploy). In the split deploy the
// backend on Render has no client build, so it runs API-only and this is
// skipped automatically.
if (isProd) {
  const clientDist = path.resolve(__dirname, '../client/dist');
  const indexHtml = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(clientDist));
    // Any non-API GET falls back to index.html for React Router.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(indexHtml);
    });
  }
}

// 404 (JSON, for unmatched /api routes) + global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

// Connect to the database, then start listening.
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });
};

start();

module.exports = app;
