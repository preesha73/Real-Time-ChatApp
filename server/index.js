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

// --- Add these lines for CORS configuration ---
const corsOptions = {
    origin: "https://real-time-chat-app-ivory-six.vercel.app/", // IMPORTANT: Replace with your Vercel app's URL
    methods: ["GET", "POST"],
    credentials: true
};
app.use(cors(corsOptions));
// --- End of CORS configuration ---

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "https://your-frontend-url.vercel.app", // IMPORTANT: Also replace it here for Socket.IO
        methods: ["GET", "POST"]
    }
});


// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));


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