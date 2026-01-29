const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const User = require('../models/User');

// @desc    Vote on a poll
// @route   POST /api/votes/:pollId
// @access  Private
const votePoll = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const { optionIds } = req.body;

    // Validate input
    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one option'
      });
    }

    // Find poll
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if poll is active
    if (poll.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Poll is not active'
      });
    }

    // Check if poll is expired
    if (new Date() > poll.expiresAt) {
      poll.status = 'closed';
      await poll.save();
      return res.status(400).json({
        success: false,
        message: 'Poll has expired'
      });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      poll: pollId,
      user: req.user.id
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // Validate poll type and option selection
    if (poll.pollType === 'single' && optionIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Single-choice polls allow only one option'
      });
    }

    // Validate that all option IDs exist in the poll
    const validOptionIds = poll.options.map(opt => opt._id.toString());
    const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id));

    if (invalidOptions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option ID(s)'
      });
    }

    // Create vote record
    const vote = await Vote.create({
      poll: pollId,
      user: req.user.id,
      selectedOptions: optionIds,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Update poll options with vote counts
    for (const optionId of optionIds) {
      const optionIndex = poll.options.findIndex(
        opt => opt._id.toString() === optionId
      );
      
      if (optionIndex !== -1) {
        poll.options[optionIndex].votes += 1;
        poll.options[optionIndex].voters.push(req.user.id);
      }
    }

    // Update total votes
    poll.totalVotes += 1;
    await poll.save();

    // Add poll to user's voted polls
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { votedPolls: pollId }
    });

    // Get updated poll with results
    const updatedPoll = await Poll.findById(pollId)
      .populate('creator', 'username avatar')
      .lean();

    const results = updatedPoll.options.map(option => ({
      _id: option._id,
      text: option.text,
      votes: option.votes,
      percentage: updatedPoll.totalVotes > 0 
        ? ((option.votes / updatedPoll.totalVotes) * 100).toFixed(2)
        : 0
    }));

 // ✅ Emit socket event to all clients in poll room
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Broadcasting vote update to poll room:', pollId);
      io.to(`poll_${pollId}`).emit('voteUpdate', {
        pollId: pollId,
        poll: updatedPoll,
        results: results
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      poll: updatedPoll,
      results,
      userVote: optionIds
    })
  } catch (error) {
    next(error);
  }}

// @desc    Get vote status for a poll
// @route   GET /api/votes/:pollId/status
// @access  Private
const getVoteStatus = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const vote = await Vote.findOne({
      poll: pollId,
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      hasVoted: !!vote,
      selectedOptions: vote ? vote.selectedOptions : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get poll results
// @route   GET /api/votes/:pollId/results
// @access  Public
const getPollResults = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    console.log('📊 Getting results for poll:', pollId);

    const poll = await Poll.findById(pollId)
      .populate('creator', 'username avatar')
      .lean();

    if (!poll) {
      console.log('❌ Poll not found');
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    console.log('✅ Poll found, calculating results...');

    // ✅ Calculate results (even if no votes)
    const results = poll.options.map(option => ({
      _id: option._id,
      text: option.text,
      votes: option.votes || 0,
      percentage: poll.totalVotes > 0 
        ? ((option.votes / poll.totalVotes) * 100).toFixed(2)
        : '0.00'
    }));

    console.log('✅ Results calculated:', results);

    res.status(200).json({
      success: true,
      poll: {
        _id: poll._id,
        question: poll.question,
        description: poll.description,
        category: poll.category,
        pollType: poll.pollType,
        status: poll.status,
        totalVotes: poll.totalVotes || 0,
        expiresAt: poll.expiresAt,
        creator: poll.creator
      },
      results
    });
  } catch (error) {
    console.error('❌ Error getting poll results:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid poll ID'
      });
    }

    next(error);
  }
};


// @desc    Remove vote (if allowed)
// @route   DELETE /api/votes/:pollId
// @access  Private
const removeVote = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const vote = await Vote.findOne({
      poll: pollId,
      user: req.user.id
    });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Update poll options - decrease vote counts
    for (const optionId of vote.selectedOptions) {
      const optionIndex = poll.options.findIndex(
        opt => opt._id.toString() === optionId.toString()
      );
      
      if (optionIndex !== -1) {
        poll.options[optionIndex].votes = Math.max(0, poll.options[optionIndex].votes - 1);
        poll.options[optionIndex].voters = poll.options[optionIndex].voters.filter(
          voterId => voterId.toString() !== req.user.id.toString()
        );
      }
    }

    // Update total votes
    poll.totalVotes = Math.max(0, poll.totalVotes - 1);
    await poll.save();

    // Remove vote record
    await vote.deleteOne();

    // Remove poll from user's voted polls
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { votedPolls: pollId }
    });

    res.status(200).json({
      success: true,
      message: 'Vote removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  votePoll,
  getVoteStatus,
  getPollResults,
  removeVote
};