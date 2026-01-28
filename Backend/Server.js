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
import { fileURLToPath } from 'url'; // Required for ES Modules

// config dotenv
dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// database connection
connectDB();

const app = express();

// middlewares
app.use(cors()); 
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

// Corrected static folder for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ NEW: SERVE REACT FRONTEND
// This assumes your React app is in a folder named 'client'
app.use(express.static(path.join(__dirname, './client/build')));

// ✅ NEW: Handle React Routing
// Redirects any unknown requests to index.html so React Router works
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white);
});