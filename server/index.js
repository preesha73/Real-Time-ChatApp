require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors'); // --- Add this line to import the cors package ---

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/messageModel');

const app = express();
const server = http.createServer(app);

// --- CORS configuration (use FRONTEND_URL env var or fallback to allow all in dev) ---
// FRONTEND_URL may be a single origin or a comma-separated list of origins.
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const allowedOrigins = FRONTEND_URL ? FRONTEND_URL.split(',').map(u => u.trim()) : [];

// Custom CORS middleware to ensure a single Access-Control-Allow-Origin header
// (browsers require the header to be a single origin or '*', not a comma-separated list)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // allow non-browser or server-to-server requests without origin
    if (!origin) {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
        return next();
    }

    // if no allowedOrigins configured, allow all origins
    if (allowedOrigins.length === 0) {
        res.header('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin)) {
        // echo back the requesting origin (must be a single value)
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // origin not allowed
        return res.status(403).json({ message: 'CORS origin not allowed' });
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});
// --- End of CORS configuration ---

app.use(express.json());

// Socket.IO CORS: if allowedOrigins provided use that array, otherwise allow all
const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length ? allowedOrigins : true,
        methods: ["GET", "POST"]
    }
});


// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Safe index migration ---
// Drop legacy index on `username` (if it exists) and ensure a unique index on `displayName`.
// This is defensive: it won't modify documents, only adjusts indexes to prevent E11000 on register.
// We run this after connecting to Mongo so it runs once per process start.
mongoose.connection.on('connected', async () => {
    try {
        const userCollection = mongoose.connection.collection('users');

        // List indexes and drop the old username_1 if present
        const indexes = await userCollection.indexes();
        const hasUsernameIndex = indexes.some(ix => ix.name === 'username_1');
        if (hasUsernameIndex) {
            console.log('Dropping legacy index: username_1');
            try { await userCollection.dropIndex('username_1'); } catch (dropErr) { console.warn('Failed to drop username_1 index:', dropErr.message || dropErr); }
        }

        // Ensure a unique index on displayName for current schema
        // Use a partialFilterExpression to only index documents where displayName exists and is not null
        console.log('Ensuring unique index on displayName');
        await userCollection.createIndex({ displayName: 1 }, { unique: true, partialFilterExpression: { displayName: { $type: 'string' } } });
    } catch (err) {
        console.warn('Index migration warning:', err.message || err);
    }
});


// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


// --- WebSocket (Socket.IO) Setup ---
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('user-online', (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit('update-online-users', Object.keys(onlineUsers));
    });

    socket.on('send-message', async (message) => {
        try {
            const newMessage = new Message({
                sender: message.senderId,
                text: message.text,
            });
            await newMessage.save();
            const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'displayName');
            io.emit('receive-message', populatedMessage);
        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
        }
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('user-typing', data);
    });

    socket.on('stop-typing', (data) => {
        socket.broadcast.emit('user-stopped-typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const disconnectedUserId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
        if (disconnectedUserId) {
            delete onlineUsers[disconnectedUserId];
            io.emit('update-online-users', Object.keys(onlineUsers));
        }
    });
});  

// --- Start server (bind to Render's provided PORT) ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Helpful hint: allow configuring the allowed origin via FRONTEND_URL env var
// (already used above for CORS/socket config). Example: FRONTEND_URL=https://your-frontend.com