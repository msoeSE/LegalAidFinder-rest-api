const mongoose = require('mongoose');

const AgencyRequestsSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: 'String', required: true },
  email: [{ type: mongoose.Schema.Types.String }],
  url: { type: 'String' },
});

module.exports = mongoose.model('Requests', AgencyRequestsSchema);
