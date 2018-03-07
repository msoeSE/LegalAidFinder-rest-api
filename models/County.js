const mongoose = require('mongoose');

const CountySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: 'String', required: true },
    state: { type: 'String', required: true },
});

module.exports = mongoose.model('County', CountySchema);
