import React from 'react';

const Header = () => {
  return (
    <header className="hero">
      <div className="hero-badge">🤖 AI-Powered Recommendations</div>
      <h1 className="hero-title">AI Learning <span className="gradient-text">Recommender</span></h1>
      <p className="hero-subtitle">
        Answer 4 quick questions and let our AI match you with the best
        books & online courses perfectly suited to your goals.
      </p>
      <div className="hero-stats">
        <div className="stat"><strong>50+</strong><span>Courses & Books</span></div>
        <div className="stat-divider"></div>
        <div className="stat"><strong>5</strong><span>Categories</span></div>
        <div className="stat-divider"></div>
        <div className="stat"><strong>3</strong><span>Skill Levels</span></div>
      </div>
    </header>
  );
};

export default Header;
