const mongoose = require('mongoose')
const { Schema } = require('mongoose');

const settingsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
})

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;