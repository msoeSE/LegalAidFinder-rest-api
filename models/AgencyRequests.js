const mongoose = require('mongoose');

const AgencyRequestsSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  agency_name: { type: 'String', required: true },
  agency_email: { type: mongoose.Schema.Types.String, required: true },
  agency_url: { type: 'String', required: true },
  contact_name: { type: 'String', required: true },
  contact_phone: {type: 'String', required: true },
  contact_email: { type: mongoose.Schema.Types.String, required: true },
  comments: { type: 'String' },
  request_status: { type: 'Number', required: true },
  date_submitted: { type: 'String', required: true },
  date_accepted: { type: 'String' }
});

module.exports = mongoose.model('Agencyrequests', AgencyRequestsSchema);
