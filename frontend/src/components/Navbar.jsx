import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="logo-wrapper"
            >
              <span className="logo-icon">📊</span>
              <span className="logo-text gradient-text">PollHub</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu desktop-menu">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/browse" 
              className={`nav-link ${isActive('/browse') ? 'active' : ''}`}
            >
              Browse Polls
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/my-polls" 
                  className={`nav-link ${isActive('/my-polls') ? 'active' : ''}`}
                >
                  My Polls
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="navbar-actions desktop-actions">
            {isAuthenticated ? (
              <>
                <Link to="/create-poll" className="btn btn-primary">
                  <span>+</span> Create Poll
                </Link>
                <div className="user-menu">
                  <Link to="/profile" className="user-avatar">
                    <img src={user?.avatar} alt={user?.username} />
                    <span>{user?.username}</span>
                  </Link>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-menu"
          >
            <div className="mobile-menu-content">
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/browse" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Browse Polls
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/my-polls" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    My Polls
                  </Link>
                  <Link to="/create-poll" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Create Poll
                  </Link>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-nav-link">
                    Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
