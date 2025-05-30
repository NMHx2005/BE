const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Description: {
    type: String,
    required: true
  },
  Price: {
    type: Number,
    default: 0,
    min: 0
  },
  Status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  ImageUrl: {
    type: String
  },
  // Add any other relevant fields (e.g., duration, included features)
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service; 