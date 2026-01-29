const express = require('express');
const router = express.Router();
const {
  votePoll,
  getVoteStatus,
  getPollResults,
  removeVote
} = require('../controllers/voteController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/:pollId/results', getPollResults);

// Protected routes
router.post('/:pollId', protect, votePoll);
router.get('/:pollId/status', protect, getVoteStatus);
router.delete('/:pollId', protect, removeVote);

module.exports = router;
