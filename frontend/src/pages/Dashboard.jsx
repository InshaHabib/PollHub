import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pollAPI, authAPI } from '../services/api';
import PollCard from '../components/PollCard';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPolls, setRecentPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pollsRes] = await Promise.all([
        authAPI.getStats(),
        pollAPI.getUserPolls()
      ]);
      
      setStats(statsRes.data.stats);
      setRecentPolls(pollsRes.data.polls.slice(0, 6));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="page-title">Welcome back, <span className="gradient-text">{user?.username}</span></h1>
          <Link to="/create-poll" className="btn btn-primary">+ Create New Poll</Link>
        </div>

        {stats && (
          <div className="stats-grid">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card glass">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <p className="stat-value">{stats.totalPollsCreated}</p>
                <p className="stat-label">Polls Created</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card glass">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <p className="stat-value">{stats.activePollsCreated}</p>
                <p className="stat-label">Active Polls</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card glass">
              <div className="stat-icon">🗳️</div>
              <div className="stat-content">
                <p className="stat-value">{stats.totalVotesReceived}</p>
                <p className="stat-label">Votes Received</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card glass">
              <div className="stat-icon">👍</div>
              <div className="stat-content">
                <p className="stat-value">{stats.totalVotesCast}</p>
                <p className="stat-label">Votes Cast</p>
              </div>
            </motion.div>
          </div>
        )}

        <div className="section-header">
          <h2 className="section-title">Your Recent Polls</h2>
          <Link to="/my-polls" className="view-all-link">View All →</Link>
        </div>

        {recentPolls.length > 0 ? (
          <div className="polls-grid">
            {recentPolls.map((poll, index) => (
              <PollCard key={poll._id} poll={poll} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state glass">
            <p>You haven't created any polls yet</p>
            <Link to="/create-poll" className="btn btn-primary">Create Your First Poll</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
