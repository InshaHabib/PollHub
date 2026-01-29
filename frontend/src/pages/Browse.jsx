import React, { useEffect, useState } from 'react';
import { pollAPI } from '../services/api';
import PollCard from '../components/PollCard';
import './Browse.css';

const Browse = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    category: 'All',
    search: ''
  });

  const categories = ['All', 'Sports', 'Politics', 'Technology', 'Entertainment', 'Science', 'Health', 'Education', 'Business', 'Other'];

  useEffect(() => {
    fetchPolls();
  }, [filters]);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const params = {
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'All' ? undefined : filters.category,
        search: filters.search || undefined
      };
      const { data } = await pollAPI.getAll(params);
      setPolls(data.polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="browse-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Browse Polls</h1>
          <p className="page-subtitle">Discover and participate in polls from the community</p>
        </div>

        <div className="filters-section glass">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search polls..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : polls.length > 0 ? (
          <div className="polls-grid">
            {polls.map((poll, index) => (
              <PollCard key={poll._id} poll={poll} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state glass">
            <p>No polls found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
