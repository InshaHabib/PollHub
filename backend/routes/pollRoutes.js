const express = require('express');
const router = express.Router();
const {
  createPoll,
  getPolls,
  getPollById,
  updatePoll,
  deletePoll,
  getUserPolls,
  getPollsByCategory,
  getTrendingPolls
} = require('../controllers/pollController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', getPolls);
router.get('/trending', getTrendingPolls);
router.get('/category/:category', getPollsByCategory);
router.get('/:id', optionalAuth, getPollById);

// Protected routes
router.post('/', protect, createPoll);
router.put('/:id', protect, updatePoll);
router.delete('/:id', protect, deletePoll);
router.get('/user/created', protect, getUserPolls);

module.exports = router;
