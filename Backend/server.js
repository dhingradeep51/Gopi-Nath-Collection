import express from 'express';
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
import path from 'path';

// config dotenv
dotenv.config();

// database connection
connectDB();

const app = express();

// --- MIDDLEWARES ---
app.use(cors({
  origin: [
    "https://gopinathcollection.co.in", 
    "http://localhost:5173", // Default Vite port
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// --- API ROUTES ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/product', productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/invoice", invoiceRoutes);

// Home Route for API verification
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Gopi Nath Collection API</h1>');
});

// Corrected: Only use 404 AFTER all routes are checked
app.use((req, res) => {
  res.status(404).json({ message: "API Route not found" });
});

// Port configuration for Render
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white);
});