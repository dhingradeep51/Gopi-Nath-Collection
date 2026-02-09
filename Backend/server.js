import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios'; // Required for the keep-alive ping
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors'; 
import connectDB from './Config/db.js';

// Route Imports
import authRoutes from './Routes/authRoute.js';
import contactRoutes from './Routes/contactRoute.js';
import productRoutes from './Routes/productRoute.js';
import categoryRoutes from './Routes/categoryRoute.js';
import couponRoutes from './Routes/couponRoute.js';
import orderRoute from './Routes/orderRoute.js';
import invoiceRoutes from './Routes/invoiceRoute.js';
import paymentRoutes from './Routes/paymentRoute.js';

// Config dotenv
dotenv.config();

// Database connection
connectDB();

const app = express();
const httpServer = createServer(app);

// CORS Configuration
app.use(cors({
  origin: [
    "https://gopinathcollection.co.in", 
    "http://localhost:5173", 
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ["https://gopinathcollection.co.in", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Socket.io Logic
io.on("connection", (socket) => {
  console.log(`New Connection: ${socket.id}`.bgYellow.black);

  socket.on("join_admin_room", () => {
    socket.join("admin-room");
    console.log("Admin entered the notification room".bgMagenta.white);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected".red);
  });
});

// --- MIDDLEWARES ---

// Standard parsing middlewares (MUST come before routes)
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Special handler for PhonePe Webhook (Must stay before any global parsers if using raw)
app.use(
  "/api/v1/payment/phonepe/webhook",
  express.raw({ type: "application/json" })
);

/** * CRITICAL FIX: Removed global app.use(formidable(...)) 
 * You must apply formidable ONLY to routes that need file uploads 
 * (like product creation) inside your actual route files.
 */

// Make 'io' accessible in your routes
app.set("io", io);

// --- API ROUTES ---
app.use('/api/v1/auth', authRoutes); // OTP and Auth will now work correctly!
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/product', productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/invoice", invoiceRoutes);
app.use("/api/v1/payment", paymentRoutes);

// --- KEEP-ALIVE & HEALTH CHECK ---
app.get('/api/v1/health-check', (req, res) => {
  res.status(200).json({ status: "active", message: "GNC Server is awake" });
});

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Gopi Nath Collection API</h1>');
});

// Self-ping service to prevent Render from sleeping (every 14 minutes)
const SERVER_URL = "https://your-backend-render-app-url.onrender.com/api/v1/health-check"; 
setInterval(async () => {
  try {
    await axios.get(SERVER_URL);
    console.log("Keep-alive ping sent successfully".gray);
  } catch (err) {
    console.error("Keep-alive ping failed:".red, err.message);
  }
}, 840000); 

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "API Route not found" });
});

const PORT = process.env.PORT || 8080;
app.set('trust proxy', 1);

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white);
});