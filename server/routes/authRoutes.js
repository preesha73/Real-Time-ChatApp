const express = require('express');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { displayName, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ displayName });
        if (existingUser) {
            return res.status(400).json({ message: 'Display name is already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ displayName, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: newUser._id, displayName: newUser.displayName } });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { displayName, password } = req.body;
        const user = await User.findOne({ displayName });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, displayName: user.displayName } });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// @route   GET /api/auth/users
// @desc    Get all users' display names
// @access  Private
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, 'displayName'); // only return displayName and _id
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

module.exports = router;

