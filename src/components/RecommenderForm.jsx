import React, { useState } from 'react';

const RecommenderForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    topic: '',
    level: '',
    goal: '',
    duration: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.topic) newErrors.topic = "Please select a topic.";
    if (!formData.level) newErrors.level = "Please choose your skill level.";
    if (!formData.goal) newErrors.goal = "Please choose a learning goal.";
    if (!formData.duration) newErrors.duration = "Please choose a course length.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <section className="form-card glass" aria-label="Preference form">
      <div className="form-header">
        <div className="ai-avatar">🧠</div>
        <div>
          <h2 className="form-title">Tell me about yourself</h2>
          <p className="form-subtitle">I'll find the perfect learning path for you</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} novalidate>
        {/* Q1: Topic */}
        <div className="form-group">
          <label className="form-label">
            <span className="q-badge">Q1</span>
            What topic do you want to learn?
          </label>
          <div className="select-wrapper">
            <select 
              name="topic" 
              value={formData.topic} 
              onChange={handleChange}
              required
            >
              <option value="" disabled>Choose a topic…</option>
              <option value="ai">🤖 Artificial Intelligence</option>
              <option value="programming">💻 Programming</option>
              <option value="data science">📊 Data Science</option>
              <option value="web development">🌐 Web Development</option>
              <option value="cybersecurity">🔐 Cybersecurity</option>
            </select>
            <span className="select-arrow">▾</span>
          </div>
          <span className="field-error">{errors.topic}</span>
        </div>

        {/* Q2: Level */}
        <div className="form-group">
          <label className="form-label">
            <span className="q-badge">Q2</span>
            What is your current skill level?
          </label>
          <div className="radio-group">
            {[
              { id: 'beg', val: 'beginner', icon: '🌱', label: 'Beginner' },
              { id: 'int', val: 'intermediate', icon: '🚀', label: 'Intermediate' },
              { id: 'adv', val: 'advanced', icon: '⚡', label: 'Advanced' }
            ].map(item => (
              <label key={item.id} className="radio-card">
                <input 
                  type="radio" 
                  name="level" 
                  value={item.val} 
                  checked={formData.level === item.val}
                  onChange={handleChange}
                />
                <span className="radio-icon">{item.icon}</span>
                <span className="radio-label">{item.label}</span>
              </label>
            ))}
          </div>
          <span className="field-error">{errors.level}</span>
        </div>

        {/* Q3: Goal */}
        <div className="form-group">
          <label className="form-label">
            <span className="q-badge">Q3</span>
            What is your learning goal?
          </label>
          <div className="radio-group">
            {[
              { id: 'job', val: 'get a job', icon: '💼', label: 'Get a Job' },
              { id: 'skills', val: 'improve skills', icon: '📈', label: 'Improve Skills' },
              { id: 'acad', val: 'academic learning', icon: '🎓', label: 'Academic' }
            ].map(item => (
              <label key={item.id} className="radio-card">
                <input 
                  type="radio" 
                  name="goal" 
                  value={item.val} 
                  checked={formData.goal === item.val}
                  onChange={handleChange}
                />
                <span className="radio-icon">{item.icon}</span>
                <span className="radio-label">{item.label}</span>
              </label>
            ))}
          </div>
          <span className="field-error">{errors.goal}</span>
        </div>

        {/* Q4: Duration */}
        <div className="form-group">
          <label className="form-label">
            <span className="q-badge">Q4</span>
            Preferred course length?
          </label>
          <div className="duration-group">
            {[
              { id: 'short', val: 'short', icon: '⚡', title: 'Short', desc: 'Under 4 weeks' },
              { id: 'medium', val: 'medium', icon: '📅', title: 'Medium', desc: '1–3 months' },
              { id: 'long', val: 'long', icon: '🏆', title: 'Long', desc: '3+ months' }
            ].map(item => (
              <label key={item.id} className="duration-card">
                <input 
                  type="radio" 
                  name="duration" 
                  value={item.val} 
                  checked={formData.duration === item.val}
                  onChange={handleChange}
                />
                <span className="dur-icon">{item.icon}</span>
                <span className="dur-title">{item.title}</span>
                <span className="dur-desc">{item.desc}</span>
              </label>
            ))}
          </div>
          <span className="field-error">{errors.duration}</span>
        </div>

        <button type="submit" className="btn-recommend" disabled={isLoading}>
          <span className={`btn-text ${isLoading ? 'hidden' : ''}`}>✨ Get My Recommendations</span>
          {isLoading && <div className="btn-spinner"></div>}
        </button>
      </form>
    </section>
  );
};

export default RecommenderForm;
