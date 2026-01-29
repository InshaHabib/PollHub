import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pollAPI } from '../services/api';
import PollCard from '../components/PollCard';
import './Home.css';

const Home = () => {
  const [trendingPolls, setTrendingPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingPolls();
  }, []);

  const fetchTrendingPolls = async () => {
    try {
      const { data } = await pollAPI.getTrending();
      setTrendingPolls(data.polls);
    } catch (error) {
      console.error('Error fetching trending polls:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <h1 className="hero-title">
              Create & Share <span className="gradient-text">Polls</span> in Real-Time
            </h1>
            <p className="hero-description">
              Gather opinions, make decisions, and engage your audience with beautiful, 
              real-time polling surveys. Get instant feedback from your community.
            </p>
            <div className="hero-actions">
              <Link to="/create-poll" className="btn btn-primary btn-lg">
                Create Your Poll
              </Link>
              <Link to="/browse" className="btn btn-outline btn-lg">
                Browse Polls
              </Link>
            </div>

            {/* Features */}
            <div className="features-grid">
              <motion.div 
                className="feature-card glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="feature-icon">⚡</div>
                <h3>Real-Time Results</h3>
                <p>Watch votes come in live with instant updates</p>
              </motion.div>

              <motion.div 
                className="feature-card glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="feature-icon">📊</div>
                <h3>Beautiful Charts</h3>
                <p>Visualize results with stunning charts</p>
              </motion.div>

              <motion.div 
                className="feature-card glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="feature-icon">🎯</div>
                <h3>Easy to Use</h3>
                <p>Create polls in seconds, share instantly</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Polls Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🔥 Trending Polls</h2>
            <p className="section-subtitle">Most popular polls right now</p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : trendingPolls.length > 0 ? (
            <div className="polls-grid">
              {trendingPolls.slice(0, 6).map((poll, index) => (
                <PollCard key={poll._id} poll={poll} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No trending polls yet. Be the first to create one!</p>
            </div>
          )}

          <div className="section-footer">
            <Link to="/browse" className="btn btn-secondary">
              View All Polls →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="cta-card glass"
          >
            <h2 className="cta-title">Ready to get started?</h2>
            <p className="cta-description">
              Join thousands of users creating engaging polls and surveys
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Sign Up Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
