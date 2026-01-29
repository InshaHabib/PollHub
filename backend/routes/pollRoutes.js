const express = require('express');
const router = express.Router();
const {
  createPoll,
  getPolls,
  getPollById,
  updatePoll,
  deletePoll,
  getPollsByCategory,
  getTrendingPolls,
  // getAllPolls,
  getUserPolls
} = require('../controllers/pollController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', getPolls);
// router.get('/', getAllPolls);
// User polls - MUST BE BEFORE /:id
router.get('/user/my-polls', protect, getUserPolls);

router.get('/trending', getTrendingPolls);
router.get('/category/:category', getPollsByCategory);
router.get('/:id', optionalAuth, getPollById);

// Protected routes
router.post('/', protect, createPoll);
router.put('/:id', protect, updatePoll);
router.delete('/:id', protect, deletePoll);

module.exports = router;
