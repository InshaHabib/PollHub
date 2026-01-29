import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pollAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './CreatePoll.css';

const CreatePoll = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', ''],
    category: 'Other',
    pollType: 'single',
    expiresAt: '',
    isPublic: true,
    tags: ''
  });

  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to create a poll');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    } else {
      toast.error('Maximum 10 options allowed');
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    } else {
      toast.error('Minimum 2 options required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate question
    if (!formData.question.trim()) {
      toast.error('Please enter a question');
      setLoading(false);
      return;
    }

    // Validate options
    const validOptions = formData.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      setLoading(false);
      return;
    }

    // Validate expiration date
    if (!formData.expiresAt) {
      toast.error('Please select an expiration date');
      setLoading(false);
      return;
    }

    const expiryDate = new Date(formData.expiresAt);
    if (expiryDate <= new Date()) {
      toast.error('Expiration date must be in the future');
      setLoading(false);
      return;
    }

    // Prepare data
    const pollData = {
      ...formData,
      options: validOptions,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    try {
      console.log('📝 Creating poll:', pollData);
      
      const { data } = await pollAPI.create(pollData);
      
      console.log('✅ Poll created:', data.poll);
      
      // Show success toast with custom styling
      toast.success(
        (t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                Poll Created Successfully!
              </strong>
              <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Redirecting to your poll...
              </span>
            </div>
          </div>
        ),
        {
          duration: 2000,
          style: {
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '1rem 1.5rem',
          }
        }
      );
      
      // Smooth redirect with delay
      setTimeout(() => {
        navigate(`/poll/${data.poll._id}`);
      }, 1500);

    } catch (error) {
      console.error('❌ Error creating poll:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create poll. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="create-poll-container"
        >
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">
              <span className="title-icon">📊</span>
              Create New Poll
            </h1>
            <p className="page-description">
              Create engaging polls and get instant feedback from your community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="poll-form glass">
            {/* Question Section */}
            <div className="form-section">
              <label htmlFor="question" className="form-label required">
                Poll Question
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="What's your question?"
                className="form-input"
                required
                maxLength={500}
              />
              <p className="input-hint">
                {formData.question.length}/500 characters
              </p>
            </div>

            {/* Description Section */}
            <div className="form-section">
              <label htmlFor="description" className="form-label">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add more context to your poll..."
                className="form-textarea"
                rows={4}
                maxLength={1000}
              />
              <p className="input-hint">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Options Section */}
            <div className="form-section">
              <label className="form-label required">
                Poll Options
              </label>
              <p className="section-hint">
                Add 2-10 options for voters to choose from
              </p>
              
              <div className="options-list">
                {formData.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="option-item"
                  >
                    <span className="option-number">{index + 1}</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="form-input option-input"
                      required
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="btn-remove-option"
                        title="Remove option"
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {formData.options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="btn btn-secondary btn-add-option"
                >
                  <span>+</span>
                  Add Option
                </button>
              )}
            </div>

            {/* Settings Grid */}
            <div className="settings-grid">
              {/* Category */}
              <div className="form-section">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Sports">🏈 Sports</option>
                  <option value="Politics">🏛️ Politics</option>
                  <option value="Technology">💻 Technology</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Science">🔬 Science</option>
                  <option value="Health">⚕️ Health</option>
                  <option value="Education">📚 Education</option>
                  <option value="Business">💼 Business</option>
                  <option value="Other">📌 Other</option>
                </select>
              </div>

              {/* Poll Type */}
              <div className="form-section">
                <label htmlFor="pollType" className="form-label">
                  Poll Type
                </label>
                <select
                  id="pollType"
                  name="pollType"
                  value={formData.pollType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="single">⚡ Single Choice</option>
                  <option value="multiple">☑️ Multiple Choice</option>
                </select>
              </div>

              {/* Expiration Date */}
              <div className="form-section">
                <label htmlFor="expiresAt" className="form-label required">
                  Expires At
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Public/Private */}
              <div className="form-section">
                <label className="form-label">Visibility</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="form-checkbox"
                    />
                    <span className="checkbox-text">
                      Make poll public
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="form-section">
              <label htmlFor="tags" className="form-label">
                Tags (Optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="programming, coding, tech (comma separated)"
                className="form-input"
              />
              <p className="input-hint">
                Separate tags with commas to help others find your poll
              </p>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/browse')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Creating Poll...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Create Poll
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="tips-section glass"
          >
            <h3 className="tips-title">💡 Tips for Great Polls</h3>
            <ul className="tips-list">
              <li>Keep your question clear and concise</li>
              <li>Provide balanced and distinct options</li>
              <li>Add a description for context if needed</li>
              <li>Choose an appropriate category for better reach</li>
              <li>Set a reasonable expiration time</li>
              <li>Use tags to make your poll discoverable</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePoll;