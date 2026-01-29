import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pollAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import './MyPolls.css';

const MyPolls = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, closed

  useEffect(() => {
    fetchMyPolls();
  }, []);

  const fetchMyPolls = async () => {
    try {
      setLoading(true);
      const { data } = await pollAPI.getMyPolls();
      console.log('✅ My polls fetched:', data.polls);
      setPolls(data.polls || []);
    } catch (error) {
      console.error('❌ Error fetching polls:', error);
      toast.error('Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      await pollAPI.delete(pollId);
      toast.success('Poll deleted successfully');
      fetchMyPolls();
    } catch (error) {
      console.error('❌ Error deleting poll:', error);
      toast.error('Failed to delete poll');
    }
  };

  const filteredPolls = polls.filter(poll => {
    if (filter === 'all') return true;
    if (filter === 'active') return poll.status === 'active';
    if (filter === 'closed') return poll.status === 'closed';
    return true;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: '🟢 Active', color: 'success' },
      closed: { text: '🔴 Closed', color: 'error' },
      upcoming: { text: '🟡 Upcoming', color: 'warning' }
    };
    const statusData = statusMap[status] || statusMap.active;
    return <span className={`badge badge-${statusData.color}`}>{statusData.text}</span>;
  };

  if (loading) {
    return (
      <div className="my-polls-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your polls...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-polls-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <span className="title-icon">📋</span>
                My Polls
              </h1>
              <p className="page-description">
                Manage and track all your created polls
              </p>
            </div>
            <button
              onClick={() => navigate('/create-poll')}
              className="btn btn-primary"
            >
              <span>➕</span>
              Create New Poll
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Polls ({polls.length})
            </button>
            <button
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({polls.filter(p => p.status === 'active').length})
            </button>
            <button
              className={`filter-tab ${filter === 'closed' ? 'active' : ''}`}
              onClick={() => setFilter('closed')}
            >
              Closed ({polls.filter(p => p.status === 'closed').length})
            </button>
          </div>

          {/* Polls Grid */}
          {filteredPolls.length === 0 ? (
            <div className="empty-state glass">
              <div className="empty-icon">📊</div>
              <h3>No Polls Found</h3>
              <p>You haven't created any polls yet. Start by creating your first poll!</p>
              <button
                onClick={() => navigate('/create-poll')}
                className="btn btn-primary"
              >
                Create Your First Poll
              </button>
            </div>
          ) : (
            <div className="polls-grid">
              {filteredPolls.map((poll, index) => (
                <motion.div
                  key={poll._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="poll-card glass"
                >
                  {/* Card Header */}
                  <div className="poll-card-header">
                    <div className="poll-badges">
                      {getStatusBadge(poll.status)}
                      <span className="badge badge-primary">
                        {poll.category}
                      </span>
                    </div>
                    <span className="poll-type">
                      {poll.pollType === 'single' ? '⚡' : '☑️'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="poll-card-body">
                    <h3 className="poll-card-title">{poll.question}</h3>
                    {poll.description && (
                      <p className="poll-card-description">
                        {poll.description.slice(0, 100)}
                        {poll.description.length > 100 && '...'}
                      </p>
                    )}
                  </div>

                  {/* Card Stats */}
                  <div className="poll-card-stats">
                    <div className="stat-item">
                      <span className="stat-icon">🗳️</span>
                      <span className="stat-value">{poll.totalVotes}</span>
                      <span className="stat-label">Votes</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <span className="stat-icon">👀</span>
                      <span className="stat-value">{poll.viewCount || 0}</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <span className="stat-icon">⏰</span>
                      <span className="stat-value">
                        {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
                      </span>
                      <span className="stat-label">Created</span>
                    </div>
                  </div>

                  {/* Expiry Info */}
                  <div className="poll-card-expiry">
                    <span className="expiry-label">Expires:</span>
                    <span className="expiry-value">
                      {formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="poll-card-actions">
                    <button
                      onClick={() => navigate(`/poll/${poll._id}`)}
                      className="btn-action btn-view"
                    >
                      <span>👁️</span>
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(poll._id)}
                      className="btn-action btn-delete"
                    >
                      <span>🗑️</span>
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyPolls;