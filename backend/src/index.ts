import dotenv from 'dotenv';

dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';

// Import delle Rotte
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import customerRoutes from './routes/customerRoutes';
import statsRoutes from './routes/statsRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Rotte API ---

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', appointmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stats', statsRoutes); // Meglio dare un prefisso specifico

// Root endpoint di cortesia (fa capire che il server è vivo)
app.get('/', (_req, res) => {
  res.json({ message: 'Schedly API is running ' });
});

// --- Startup ---

app.listen(PORT, () => {
  console.log(`
    Schedly Server attivo sulla porta: ${PORT}
    URL: http://localhost:${PORT}
  `);
});