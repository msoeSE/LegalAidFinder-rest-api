const mongoose = require('mongoose');

const HomePageSchema = new mongoose.Schema({
    title: {type: mongoose.Schema.Types.String, required: true},
    description: {type: mongoose.Schema.Types.String, required: true}
});

module.exports = mongoose.model('HomePage', HomePageSchema);
