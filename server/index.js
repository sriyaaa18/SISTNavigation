import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './src/router/userRouter.js';

// ===== Express App Setup =====
const app = express();
app.use(express.json());

// ===== Variables =====

const PORT = 5000
const MONGO_URI = 'mongodb://localhost:27017/Nav-Database';

// ===== links =====
app.use(cors())
app.use("/api/v1", userRouter);

// ===== MongoDB Connection =====
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });
