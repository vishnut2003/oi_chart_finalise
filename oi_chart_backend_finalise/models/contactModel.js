const mongoose = require('mongoose')
const { Schema } = require('mongoose');

const contactSchema = new Schema({
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    }
})

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;