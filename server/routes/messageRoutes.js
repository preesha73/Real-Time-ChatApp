const express = require('express');
const Message = require('../models/messageModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/messages
// @desc    Get all messages
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch messages and sort by creation date, populate sender info
        const messages = await Message.find().sort({ createdAt: 1 }).populate('sender', 'displayName');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

module.exports = router;

