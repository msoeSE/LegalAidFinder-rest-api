const mongoose = require('mongoose');

const HeaderSchema = new mongoose.Schema({
    header: {type: mongoose.Schema.Types.String, required: true}
});

module.exports = mongoose.model('Header', HeaderSchema);
