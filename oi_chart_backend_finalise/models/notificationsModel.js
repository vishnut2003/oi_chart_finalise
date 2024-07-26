const mongoose = require('mongoose')
const { Schema } = require('mongoose');

const notificationsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

const Notifications = mongoose.model('Notifications', notificationsSchema);

module.exports = Notifications;