import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import './PollCard.css';

const PollCard = ({ poll, index }) => {
  const { 
    _id, 
    question, 
    description, 
    category, 
    totalVotes, 
    status, 
    expiresAt,
    creator,
    createdAt 
  } = poll;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'error';
      case 'upcoming':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const timeUntilExpiry = formatDistanceToNow(new Date(expiresAt), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/poll/${_id}`} className="poll-card-link">
        <div className="poll-card">
          <div className="poll-card-header">
            <span className={`badge badge-${getStatusColor(status)}`}>
              {status}
            </span>
            <span className="poll-category">{category}</span>
          </div>

          <div className="poll-card-content">
            <h3 className="poll-question">{question}</h3>
            {description && (
              <p className="poll-description">
                {description.length > 100 
                  ? `${description.substring(0, 100)}...` 
                  : description}
              </p>
            )}
          </div>

          <div className="poll-card-footer">
            <div className="poll-stats">
              <div className="stat-item">
                <span className="stat-icon">🗳️</span>
                <span className="stat-value">{totalVotes}</span>
                <span className="stat-label">votes</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-icon">⏰</span>
                <span className="stat-value">{timeUntilExpiry}</span>
              </div>
            </div>

            {creator && (
              <div className="poll-creator">
                <img 
                  src={creator.avatar} 
                  alt={creator.username} 
                  className="creator-avatar"
                />
                <span className="creator-name">@{creator.username}</span>
              </div>
            )}
          </div>

          <div className="poll-card-overlay">
            <span className="view-poll-text">View Poll →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PollCard;
