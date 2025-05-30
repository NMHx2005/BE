const mongoose = require('mongoose');

const newsEventSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true,
    trim: true
  },
  Content: {
    type: String,
    required: true
  },
  PublishDate: {
    type: Date,
    default: Date.now
  },
  ImageUrl: {
    type: String
  },
  Status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  // Add any other relevant fields (e.g., author, tags, category)
}, { timestamps: true });

const NewsEvent = mongoose.model('NewsEvent', newsEventSchema);

module.exports = NewsEvent; 