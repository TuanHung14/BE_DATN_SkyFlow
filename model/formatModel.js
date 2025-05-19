const mongoose = require('mongoose');

const formatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['2D', '3D', 'IMAX', '4DX']
    }
})

formatSchema.on('init', async (model) => {
    const defaultFormats = [
        { name: '2D' },
        { name: '3D' },
        { name: 'IMAX' },
        { name: '4DX' }
    ];

    for (const format of defaultFormats) {
        await model.findOneAndUpdate(
            { name: format.name },
            { $set: { name: format.name } },
            { upsert: true, new: true }
        );
    }
});

const Format = mongoose.model('Format', formatSchema);

module.exports = Format;


