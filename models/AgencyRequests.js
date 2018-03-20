const mongoose = require('mongoose');

const AgencyRequestsSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: 'String', required: true },
  email: [{ type: mongoose.Schema.Types.String }],
  url: { type: 'String', required: true },
});

module.exports = mongoose.model('AgencyRequests', AgencyRequestsSchema);
