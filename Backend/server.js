import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
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

// --- CORS CONFIGURATION ---
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

// --- SOCKET.IO SETUP ---
const io = new Server(httpServer, {
  cors: {
    origin: ["https://gopinathcollection.co.in", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

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

// Pass socket.io to req object for use in routes
app.set("io", io);

// --- MIDDLEWARES ---
app.use(morgan('dev'));

// Special handler for PhonePe Webhook (Must stay before express.json if using raw body)
app.use(
  "/api/v1/payment/phonepe/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/product', productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/invoice", invoiceRoutes);
app.use("/api/v1/payment", paymentRoutes);

// --- HEALTH CHECK & KEEP-ALIVE ---
app.get('/api/v1/health-check', (req, res) => {
  res.status(200).json({ 
    status: "active", 
    message: "GNC Server is awake",
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Gopi Nath Collection API</h1>');
});

/**
 * KEEP-ALIVE LOGIC
 * Pings the server every 14 minutes to prevent Render from sleeping.
 * Note: If the server is ALREADY asleep, this won't wake it. 
 * You still need an external ping (like cron-job.org) for 100% uptime.
 */
const SERVER_URL = "https://gopi-nath-collection.onrender.com/api/v1/health-check"; 

const startKeepAlive = () => {
  setInterval(async () => {
    try {
      const response = await axios.get(SERVER_URL);
      console.log(`[Keep-Alive] Status: ${response.data.status} at ${new Date().toLocaleTimeString()}`.gray);
    } catch (err) {
      console.error("[Keep-Alive] Failed to ping server:".red, err.message);
    }
  }, 840000); // 14 minutes
};

// --- ERROR HANDLER ---
app.use((req, res) => {
  res.status(404).json({ message: "API Route not found" });
});

// --- SERVER START ---
const PORT = process.env.PORT || 8080;
app.set('trust proxy', 1);

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.DEV_MODE || 'production'} mode on port ${PORT}`.bgCyan.white);
  
  // Start the pinging service after server starts
  if (process.env.NODE_ENV === 'production') {
    startKeepAlive();
  }
});