const mongoose = require('mongoose');

const AgencySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: 'String', required: true },
  emails: [{ type: mongoose.Schema.Types.String }],
  counties: [{type: mongoose.Schema.Types.String}],
  url: { type: 'String', required: true },
});

module.exports = mongoose.model('Agency', AgencySchema);
