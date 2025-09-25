const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();

const User = require('./models/userModel');
const Message = require('./models/messageModel');

const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// --- API Routes (A real app would have these in a separate routes folder) ---
// Simple user registration (in a real app, hash passwords!)
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ username, password }); // In production, hash the password!
        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Simple user login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password }); // NEVER do this in prod
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        res.json({ username: user.username, userId: user._id });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Fetch message history for a room
app.get('/api/messages/:room', async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.room }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).send('Server Error');
    }
})


// --- Socket.IO Setup ---
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity
        methods: ["GET", "POST"]
    }
});

let onlineUsers = {}; // { userId: { username, socketId } }

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User goes online
    socket.on('go-online', ({ userId, username }) => {
        onlineUsers[userId] = { username, socketId: socket.id };
        io.emit('online-users', Object.values(onlineUsers).map(u => u.username));
    });
    
    // User joins a room
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    // Handle new messages
    socket.on('send-message', async (data) => {
        const { room, sender, text, username } = data;
        
        // Save message to MongoDB
        const newMessage = new Message({ room, sender, text, username });
        await newMessage.save();

        // Broadcast message to everyone in the room
        io.to(room).emit('receive-message', newMessage);
    });

    // Handle typing indicators
    socket.on('typing', ({ room, username }) => {
        socket.to(room).emit('typing', `${username} is typing...`);
    });

    socket.on('stop-typing', (room) => {
        socket.to(room).emit('stop-typing');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Find user by socket.id and remove them
        const disconnectedUser = Object.entries(onlineUsers).find(([, val]) => val.socketId === socket.id);
        if(disconnectedUser) {
            delete onlineUsers[disconnectedUser[0]];
            io.emit('online-users', Object.values(onlineUsers).map(u => u.username));
        }
    });
});


// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
