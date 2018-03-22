const mongoose = require('mongoose');

const EligibilityTypeSchema = new mongoose.Schema({
  _id: {type: mongoose.Schema.Types.ObjectId},
  name: {type: mongoose.Schema.Types.String, required: true},
  comparators: [{ type: mongoose.Schema.Types.String }],
  valueType: {type: mongoose.Schema.Types.String, required: true}
});

module.exports = mongoose.model('Eligibilitytype', EligibilityTypeSchema);
