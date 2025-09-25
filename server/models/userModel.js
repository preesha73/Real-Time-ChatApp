const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    // In a real app, you would not store passwords in plain text.
    // Use a library like bcrypt to hash passwords.
});

module.exports = mongoose.model('User', UserSchema);
