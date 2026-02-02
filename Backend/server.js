import express from 'express';
import { createServer } from 'http'; // Add this
import { Server } from 'socket.io';   // Add this
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors'; 
import connectDB from './Config/db.js';
import authRoutes from './Routes/authRoute.js';
import contactRoutes from './Routes/contactRoute.js';
import productRoutes from './Routes/productRoute.js';
import categoryRoutes from './Routes/categoryRoute.js';
import couponRoutes from './Routes/couponRoute.js';
import orderRoute from './Routes/orderRoute.js';
import invoiceRoutes from './Routes/invoiceRoute.js';
import paymentRoutes from './Routes/paymentRoute.js';

// config dotenv
dotenv.config();

// database connection
connectDB();

const app = express();
const httpServer = createServer(app); // Create HTTP server

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

  // Admin joins a specific room to receive notifications
  socket.on("join_admin_room", () => {
    socket.join("admin-room");
    console.log("Admin entered the notification room".bgMagenta.white);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected".red);
  });
});

// --- MIDDLEWARES ---
app.use(cors({
  origin: ["https://gopinathcollection.co.in", "http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Make 'io' accessible in your routes
app.set("io", io);

// --- API ROUTES ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/product', productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/invoice", invoiceRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Gopi Nath Collection API</h1>');
});

app.use((req, res) => {
  res.status(404).json({ message: "API Route not found" });
});

const PORT = process.env.PORT || 8080;
app.set('trust proxy', 1);

// CRITICAL: Change app.listen to httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white);
});