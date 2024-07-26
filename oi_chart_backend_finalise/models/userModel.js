const mongoose = require('mongoose')
const { Schema } = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    loggedIn: {
        type: String,
        default: 'nothing'
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetToken: {
        type: String,
        default: 'nothing'
    }
})

const User = mongoose.model('Users', userSchema);

module.exports = User;