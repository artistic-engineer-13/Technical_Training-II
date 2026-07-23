import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Config and Service Imports
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initSocket } from './services/socketService.js';
import errorHandler from './middlewares/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Webhook handler import (must be parsed raw, hence imported here)
import { stripeWebhook } from './controllers/paymentController.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

// Configure Cloudinary uploads
configureCloudinary();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io connection instance
initSocket(server);

// 1. Mount Security Headers via Helmet
app.use(helmet());

// 2. Enable CORS with credentials matching frontend host
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// 3. Define raw body parser specifically for Stripe webhook BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// 4. Parse incoming JSON requests and cookie payloads
app.use(express.json());
app.use(cookieParser());

// Express v5 prototype mutation compatibility middleware
// Overcomes 'Cannot set property query of #<IncomingMessage> which has only a getter'
// by redefining query and params properties on request as writable.
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  if (req.params) {
    Object.defineProperty(req, 'params', {
      value: { ...req.params },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});

// 5. Sanitize data to protect against NoSQL Mongo Injections
app.use(mongoSanitize());

// 6. Apply API rate limiting protection (100 requests per 10 minutes)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 10 minutes',
  },
});
app.use('/api/', limiter);

// 7. Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes); // handles razorpay and stripe checkout
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Base route test check
app.get('/', (req, res) => {
  res.json({ message: 'Online Grocery Delivery System API is running...' });
});

// 8. Mount Centralized Global Error Handler Middleware
app.use(errorHandler);

// Start server listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
