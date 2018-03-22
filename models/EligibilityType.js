const mongoose = require('mongoose');

const EligibilityTypeSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    name: {type: mongoose.Schema.Types.ObjectId, required: true},
    comparators: [
      {val: {type: 'String', required: true}}
    ],
    valueType: {key: {type: 'String', required: true}}
});

module.exports = mongoose.model('EligibilityType', EligibilityTypeSchema);
