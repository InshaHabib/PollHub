import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { formatDistanceToNow } from 'date-fns';
import { pollAPI, voteAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PollDetail.css';

const PollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchPollDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📊 Fetching poll:', id);

        // Fetch poll data
        const pollResponse = await pollAPI.getById(id);
        
        if (!mounted) return;
        
        if (!pollResponse?.data?.poll) {
          throw new Error('Poll data not found');
        }

        console.log('✅ Poll fetched:', pollResponse.data.poll);
        setPoll(pollResponse.data.poll);
        
        // Check if user has voted
        if (pollResponse.data.userVote) {
          setHasVoted(true);
          setSelectedOptions(pollResponse.data.userVote);
          console.log('✅ User has already voted');
        }

        // Fetch results
        try {
          const resultsResponse = await voteAPI.getResults(id);
          if (mounted && resultsResponse?.data?.results) {
            console.log('✅ Results fetched:', resultsResponse.data.results);
            setResults(resultsResponse.data.results);
          }
        } catch (resultsError) {
          console.warn('⚠️ Results not available yet:', resultsError);
          // Initialize empty results from poll options
          if (pollResponse.data.poll?.options) {
            const emptyResults = pollResponse.data.poll.options.map(opt => ({
              _id: opt._id,
              text: opt.text,
              votes: 0,
              percentage: '0.00'
            }));
            setResults(emptyResults);
          }
        }

      } catch (err) {
        console.error('❌ Error fetching poll:', err);
        if (mounted) {
          setError(err.response?.data?.message || 'Failed to load poll');
          toast.error('Failed to load poll');
          setTimeout(() => navigate('/browse'), 2000);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPollDetails();

    // Socket connection for real-time updates
    try {
      socketService.connect();
      socketService.joinPoll(id);
      socketService.onVoteUpdate(handleVoteUpdate);
      console.log('📡 Joined poll room for real-time updates');
    } catch (socketError) {
      console.warn('⚠️ Socket connection failed:', socketError);
    }

    return () => {
      mounted = false;
      try {
        socketService.leavePoll(id);
        socketService.offVoteUpdate();
        console.log('🚪 Left poll room');
      } catch (err) {
        console.warn('⚠️ Cleanup error:', err);
      }
    };
  }, [id, navigate]);

  const handleVoteUpdate = (data) => {
    try {
      console.log('📡 Vote update received:', data);
      if (data?.pollId === id || data?.poll?._id === id) {
        if (data.poll) {
          setPoll(prev => ({
            ...prev,
            totalVotes: data.poll.totalVotes || 0,
            options: data.poll.options || prev?.options || []
          }));
        }
        if (data.results) {
          setResults(data.results);
        }
      }
    } catch (err) {
      console.error('❌ Error handling vote update:', err);
    }
  };

  const handleOptionSelect = (optionId) => {
    if (!optionId) return;
    
    if (poll?.pollType === 'single') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      navigate('/login');
      return;
    }

    if (selectedOptions.length === 0) {
      toast.error('Please select an option');
      return;
    }

    setVoting(true);

    try {
      console.log('📤 Submitting vote:', selectedOptions);
      
      await voteAPI.vote(id, { optionIds: selectedOptions });
      
      setHasVoted(true);
      toast.success('Vote recorded successfully! 🎉');
      
      // Refresh poll data
      const pollResponse = await pollAPI.getById(id);
      if (pollResponse?.data?.poll) {
        setPoll(pollResponse.data.poll);
      }
      
      const resultsResponse = await voteAPI.getResults(id);
      if (resultsResponse?.data?.results) {
        setResults(resultsResponse.data.results);
      }

      console.log('✅ Vote submitted and data refreshed');
      
    } catch (err) {
      console.error('❌ Error voting:', err);
      toast.error(err.response?.data?.message || 'Failed to vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="poll-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading poll...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !poll) {
    return (
      <div className="poll-detail-page">
        <div className="container">
          <div className="error-container">
            <div className="error-content">
              <h2>😕 Oops!</h2>
              <p>{error || 'Poll not found'}</p>
              <button onClick={() => navigate('/browse')} className="btn btn-primary">
                Browse Polls
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe chart data preparation
  const hasResults = results && Array.isArray(results) && results.length > 0;
  const hasVotes = poll.totalVotes > 0;

  const chartData = hasResults ? {
    labels: results.map(r => r?.text || 'Option'),
    datasets: [{
      label: 'Votes',
      data: results.map(r => Number(r?.votes) || 0),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(251, 146, 60, 0.8)',
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(20, 184, 166, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(251, 146, 60, 1)',
      ],
      borderWidth: 2
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType === 'pie',
        position: 'bottom',
        labels: {
          color: '#f1f5f9',
          padding: 15,
          font: { 
            size: 12, 
            family: 'Sora, sans-serif' 
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed || context.parsed.y || 0;
            label += ' votes';
            return label;
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#94a3b8', 
          stepSize: 1,
          precision: 0,
          font: { family: 'Sora, sans-serif' }
        },
        grid: { 
          color: 'rgba(99, 102, 241, 0.1)',
          drawBorder: false
        }
      },
      x: {
        ticks: { 
          color: '#94a3b8',
          font: { family: 'Sora, sans-serif' }
        },
        grid: { display: false }
      }
    } : {}
  };

  const getStatusBadge = () => {
    const status = poll?.status || 'active';
    const statusMap = {
      active: { text: '🟢 Active', color: 'success' },
      closed: { text: '🔴 Closed', color: 'error' },
      upcoming: { text: '🟡 Upcoming', color: 'warning' }
    };
    const statusData = statusMap[status] || statusMap.active;
    return <span className={`badge badge-${statusData.color}`}>{statusData.text}</span>;
  };

  return (
    <div className="poll-detail-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="poll-detail-container"
        >
          {/* Poll Header */}
          <div className="poll-header glass">
            <div className="poll-meta">
              {getStatusBadge()}
              <span className="poll-category-badge badge badge-primary">
                {poll.category || 'Other'}
              </span>
              <span className="poll-type-badge">
                {poll.pollType === 'single' ? '⚡ Single Choice' : '☑️ Multiple Choice'}
              </span>
            </div>

            <h1 className="poll-title">{poll.question || 'Untitled Poll'}</h1>
            
            {poll.description && (
              <p className="poll-description">{poll.description}</p>
            )}

            <div className="poll-info">
              <div className="info-item">
                <span className="info-icon">🗳️</span>
                <span className="info-value">{poll.totalVotes || 0}</span>
                <span className="info-label">Total Votes</span>
              </div>
              <div className="info-divider"></div>
              <div className="info-item">
                <span className="info-icon">👀</span>
                <span className="info-value">{poll.viewCount || 0}</span>
                <span className="info-label">Views</span>
              </div>
              <div className="info-divider"></div>
              <div className="info-item">
                <span className="info-icon">⏰</span>
                <span className="info-value">
                  {poll.expiresAt 
                    ? formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })
                    : 'No expiry'}
                </span>
                <span className="info-label">Expires</span>
              </div>
            </div>

            {poll.creator && (
              <div className="poll-creator-info">
                <img 
                  src={poll.creator.avatar || 'https://ui-avatars.com/api/?name=User'} 
                  alt={poll.creator.username || 'User'}
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=User&background=6366f1';
                  }}
                />
                <div>
                  <p className="creator-label">Created by</p>
                  <p className="creator-name">@{poll.creator.username || 'Anonymous'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Voting Section */}
          {!hasVoted && poll.status === 'active' && poll.options && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="voting-section glass"
            >
              <h2 className="section-title">Cast Your Vote</h2>
              <p className="voting-instruction">
                {poll.pollType === 'single' 
                  ? 'Select one option' 
                  : 'Select one or more options'}
              </p>
              
              <div className="options-list-voting">
                {poll.options.map((option, index) => (
                  <motion.div
                    key={option._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`option-card ${selectedOptions.includes(option._id) ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option._id)}
                  >
                    <div className="option-selector">
                      {poll.pollType === 'single' ? (
                        <div className={`radio ${selectedOptions.includes(option._id) ? 'checked' : ''}`}>
                          {selectedOptions.includes(option._id) && <span>●</span>}
                        </div>
                      ) : (
                        <div className={`checkbox ${selectedOptions.includes(option._id) ? 'checked' : ''}`}>
                          {selectedOptions.includes(option._id) && <span>✓</span>}
                        </div>
                      )}
                    </div>
                    <span className="option-text">{option.text || 'Option'}</span>
                    {selectedOptions.includes(option._id) && (
                      <span className="selected-indicator">✓</span>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <button
                onClick={handleVote}
                className="btn btn-primary btn-lg btn-vote"
                disabled={voting || selectedOptions.length === 0}
              >
                {voting ? (
                  <>
                    <span className="spinner-small"></span>
                    Submitting Vote...
                  </>
                ) : (
                  <>
                    <span>🗳️</span>
                    Submit Vote
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Results Section */}
          {(hasVoted || poll.status !== 'active') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="results-section glass"
            >
              <div className="results-header">
                <h2 className="section-title">Poll Results</h2>
                {hasVotes && (
                  <div className="chart-toggle">
                    <button
                      className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                      onClick={() => setChartType('bar')}
                    >
                      📊 Bar Chart
                    </button>
                    <button
                      className={`toggle-btn ${chartType === 'pie' ? 'active' : ''}`}
                      onClick={() => setChartType('pie')}
                    >
                      🥧 Pie Chart
                    </button>
                  </div>
                )}
              </div>

              {/* Chart */}
              {chartData && hasVotes ? (
                <div className="chart-container">
                  {chartType === 'bar' ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <Pie data={chartData} options={chartOptions} />
                  )}
                </div>
              ) : (
                <div className="no-votes-message">
                  <div className="no-votes-content">
                    <span className="no-votes-icon">🗳️</span>
                    <h3>No Votes Yet</h3>
                    <p>Be the first to vote on this poll!</p>
                  </div>
                </div>
              )}

              {/* Detailed Results */}
              {hasResults && (
                <div className="results-list">
                  <h3 className="results-list-title">Detailed Breakdown</h3>
                  {results.map((result, index) => (
                    <motion.div
                      key={result._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="result-item"
                    >
                      <div className="result-header">
                        <span className="result-option">
                          <span className="result-rank">#{index + 1}</span>
                          {result.text || 'Option'}
                        </span>
                        <span className="result-stats">
                          <strong>{result.votes || 0}</strong> votes 
                          <span className="result-percentage">({result.percentage || '0.00'}%)</span>
                        </span>
                      </div>
                      <div className="result-bar">
                        <motion.div
                          className="result-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.percentage || 0}%` }}
                          transition={{ duration: 1, delay: 0.2 * index, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Poll Tags */}
              {poll.tags && poll.tags.length > 0 && (
                <div className="poll-tags">
                  <h4>Tags:</h4>
                  <div className="tags-list">
                    {poll.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="back-button-container"
          >
            <button onClick={() => navigate('/browse')} className="btn btn-secondary">
              ← Back to Browse
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PollDetail;