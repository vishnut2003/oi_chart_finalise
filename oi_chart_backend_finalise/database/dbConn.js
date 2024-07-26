const mongoose = require('mongoose');

const connect = async (done) => {
    const URL = process.env.DB_URL;
    try {
        await mongoose.connect(URL)
        .then((client) => {
            console.log('Database connected successfully');
            done()
        })
        .catch((err) => {
            throw err;
        })
    } catch (err) {
        console.log(err);
    }
}

module.exports = connect;