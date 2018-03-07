const mongoose = require('mongoose');

const EligibilitySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    category: { type: mongoose.Schema.Types.ObjectId },
    agency: { type: mongoose.Schema.Types.ObjectId },
    key_comparator_value: [{
      key: { type: 'String', required: true },
      comparator: { type: 'String', required: true },
      value: { type: 'String', required: true },
    }],
  });

module.exports = mongoose.model('Eligibility', EligibilitySchema);
