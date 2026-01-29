const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
    minlength: [10, 'Question must be at least 10 characters long'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 10;
      },
      message: 'Poll must have between 2 and 10 options'
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Sports', 'Politics', 'Technology', 'Entertainment', 'Science', 'Health', 'Education', 'Business', 'Other'],
    default: 'Other'
  },
  pollType: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single',
    required: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Please provide an expiration date']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'upcoming'],
    default: 'active'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  allowAnonymous: {
    type: Boolean,
    default: false
  },
  maxVotesPerUser: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
pollSchema.index({ status: 1, category: 1, createdAt: -1 });
pollSchema.index({ creator: 1 });
pollSchema.index({ expiresAt: 1 });

// Virtual for checking if poll is expired
pollSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// ✅ Update status - NO next() for async functions in Mongoose 8.x
pollSchema.methods.updateStatus = async function() {
  const now = new Date();
  if (now > this.expiresAt) {
    this.status = 'closed';
  } else if (now < this.createdAt) {
    this.status = 'upcoming';
  } else {
    this.status = 'active';
  }
  return this.save();
};

// ✅ Pre-save hook - NO next() needed
pollSchema.pre('save', function() {
  const now = new Date();
  if (this.isNew) {
    if (now > this.expiresAt) {
      this.status = 'closed';
    } else if (now < this.createdAt) {
      this.status = 'upcoming';
    } else {
      this.status = 'active';
    }
  }
});

// Calculate vote percentages
pollSchema.methods.getResults = function() {
  const total = this.totalVotes;
  return this.options.map(option => ({
    _id: option._id,
    text: option.text,
    votes: option.votes,
    percentage: total > 0 ? ((option.votes / total) * 100).toFixed(2) : 0
  }));
};

module.exports = mongoose.model('Poll', pollSchema);