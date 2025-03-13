const mongoose = require('mongoose');

exports.connect = () => {
    const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

    mongoose.connect(DB, {})
    .then(() => console.log('Connected to MongoDB'))
} 





