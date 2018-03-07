const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: 'String', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, default: null },
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  agencies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Agency' }],
});

module.exports = mongoose.model('Category', CategorySchema);
