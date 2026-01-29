import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo-container">
              <h3 className="footer-logo">
                <span className="logo-icon">📊</span>
                <span className="logo-text">PollHub</span>
              </h3>
            </div>
           <p className="footer-description">
              PollHub lets you create, share, and analyze polls in real time. 
              Engage your community, collect instant feedback, and turn opinions 
              into meaningful insights with our smart and easy-to-use polling system.
            </p>
            {/* <div className="footer-social">
              <a 
                href="https://github.com/waqamu" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                title="GitHub"
              >
                <span>💻</span>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                title="LinkedIn"
              >
                <span>💼</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                title="Twitter"
              >
                <span>🐦</span>
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => handleNavigation('/')}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/browse')}>
                  Browse Polls
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/create-poll')}>
                  Create Poll
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/dashboard')}>
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/my-polls')}>
                  My Polls
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          {/* <div className="footer-section">
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => handleNavigation('/browse?category=Technology')}>
                  💻 Technology
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/browse?category=Sports')}>
                  🏈 Sports
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/browse?category=Entertainment')}>
                  🎬 Entertainment
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/browse?category=Business')}>
                  💼 Business
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/browse?category=Education')}>
                  📚 Education
                </button>
              </li>
            </ul>
          </div> */}

          {/* Resources */}
          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => handleNavigation('/browse?status=trending')}>
                  🔥 Trending Polls
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/browse?status=active')}>
                  ✅ Active Polls
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/profile')}>
                  👤 Profile
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy;{currentYear} PollHub. All rights reserved.
            </p>
            <p className="footer-author">
              Developed by <strong>Insha Habib</strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;