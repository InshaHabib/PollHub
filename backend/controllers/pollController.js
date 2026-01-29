const Poll = require('../models/Poll');
const User = require('../models/User');
const Vote = require('../models/Vote');

// @desc    Create new poll
// @route   POST /api/polls
// @access  Private
const createPoll = async (req, res, next) => {
  try {
    const {
      question,
      description,
      options,
      category,
      pollType,
      expiresAt,
      isPublic,
      allowAnonymous,
      tags
    } = req.body;

    // Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Poll must have at least 2 options'
      });
    }

    // Create poll
    const poll = await Poll.create({
      question,
      description,
      options: options.map(opt => ({ text: opt, votes: 0, voters: [] })),
      category,
      pollType,
      expiresAt,
      isPublic,
      allowAnonymous,
      tags,
      creator: req.user.id
    });

    // Add poll to user's created polls
    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdPolls: poll._id }
    });

    const populatedPoll = await Poll.findById(poll._id)
      .populate('creator', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      poll: populatedPoll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all polls with filtering and search
// @route   GET /api/polls
// @access  Public
const getPolls = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    let query = { isPublic: true };

    // Filter by status
    if (status && ['active', 'closed', 'upcoming'].includes(status)) {
      query.status = status;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by question or tags
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const polls = await Poll.find(query)
      .populate('creator', 'username avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const total = await Poll.countDocuments(query);

    res.status(200).json({
      success: true,
      count: polls.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      polls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single poll by ID
// @route   GET /api/polls/:id
// @access  Public
const getPollById = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('creator', 'username avatar bio')
      .lean();

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Increment view count
    await Poll.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Check if user has voted (if authenticated)
    let userVote = null;
    if (req.user) {
      userVote = await Vote.findOne({
        poll: req.params.id,
        user: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      poll,
      userVote: userVote ? userVote.selectedOptions : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update poll
// @route   PUT /api/polls/:id
// @access  Private
const updatePoll = async (req, res, next) => {
  try {
    let poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check ownership
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this poll'
      });
    }

    // Prevent updating if poll has votes
    if (poll.totalVotes > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update poll that has received votes'
      });
    }

    const { question, description, expiresAt, isPublic, tags } = req.body;

    poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { question, description, expiresAt, isPublic, tags },
      { new: true, runValidators: true }
    ).populate('creator', 'username avatar');

    res.status(200).json({
      success: true,
      message: 'Poll updated successfully',
      poll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// @access  Private
const deletePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check ownership
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this poll'
      });
    }

    await poll.deleteOne();

    // Remove poll from user's created polls
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { createdPolls: poll._id }
    });

    // Delete associated votes
    await Vote.deleteMany({ poll: poll._id });

    res.status(200).json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's created polls
// @route   GET /api/polls/user/created
// @access  Private
// Get user's polls
const getUserPolls = async (req, res) => {
  try {
    console.log('📊 getUserPolls called');
    console.log('📊 User ID:', req.user._id);

    const polls = await Poll.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .populate('creator', 'username email avatar');

    console.log(`✅ Found ${polls.length} polls for user`);

    res.status(200).json({
      success: true,
      count: polls.length,
      polls: polls
    });

  } catch (error) {
    console.error('❌ Error in getUserPolls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user polls',
      error: error.message
    });
  }
};

// @desc    Get polls by category
// @route   GET /api/polls/category/:category
// @access  Public
const getPollsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const polls = await Poll.find({ category, isPublic: true })
      .populate('creator', 'username avatar')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Poll.countDocuments({ category, isPublic: true });

    res.status(200).json({
      success: true,
      count: polls.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      polls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending polls (most votes in last 24 hours)
// @route   GET /api/polls/trending
// @access  Public
const getTrendingPolls = async (req, res, next) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const polls = await Poll.find({
      isPublic: true,
      status: 'active',
      createdAt: { $gte: yesterday }
    })
      .populate('creator', 'username avatar')
      .sort('-totalVotes -createdAt')
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      count: polls.length,
      polls
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPoll,
  getPolls,
  getUserPolls,
  getPollById,
  updatePoll,
  deletePoll,
  getPollsByCategory,
  getTrendingPolls
};
