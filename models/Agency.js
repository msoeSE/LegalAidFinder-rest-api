const mongoose = require('mongoose');

const AgencySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: 'String', required: true },
  emails: [{ type: 'String' }],
  counties: [{type: 'String'}],
  url: { type: 'String', required: true },
  phone: { type: 'String' },
  operation: { type: 'String'}
});

module.exports = mongoose.model('Agency', AgencySchema);
