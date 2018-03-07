const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    email: { type: 'String', required: true },
  });

module.exports = mongoose.model('Admin', AdminSchema);
