import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './src/router/userRouter.js';
import http from 'http';
import { Server } from 'socket.io';

// ===== Express App Setup =====
const app = express();
app.use(express.json());
dotenv.config();
app.use(cors());
app.use("/api/v1", userRouter);

// ===== MongoDB =====
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ===== HTTP Server & Socket.IO Setup =====
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ===== WebSocket Logic =====
const users = {};

io.on('connection', (socket) => {

    socket.on('updateLocation', (data) => {
        console.log(`📍 Location update received from user: ${data.name}`);
        console.log(`   → Latitude: ${data.location.lat}`);
        console.log(`   → Longitude: ${data.location.lng}`);
        console.log(`   → Accuracy: ±${data.location.accuracy} meters`);
        console.log(`   → Timestamp: ${new Date(data.location.timestamp).toLocaleString()}`);

        users[data.phoneNumber] = data.location;

        io.emit('locationUpdate', {
            phoneNumber: data.phoneNumber,
            name: data.name,
            location: data.location
        });
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
    });
});

// ===== Start Server =====
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });
