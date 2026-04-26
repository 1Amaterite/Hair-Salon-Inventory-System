const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'sales'], required: true },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('User', userSchema);