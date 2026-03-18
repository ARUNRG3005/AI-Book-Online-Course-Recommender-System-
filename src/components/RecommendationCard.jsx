import React, { useState } from 'react';
import { CATEGORY_EMOJI } from '../data/courses';

const RecommendationCard = ({ course, rank }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const simPct = course.similarity || 0;
  const stars = "★".repeat(Math.floor(course.rating)) + (course.rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(course.rating));

  const generateRoadmap = (c) => {
    const dur = c.duration.toLowerCase();
    const cat = c.category.toLowerCase();
    const steps = [
      { title: "Foundation & Setup", desc: `Install tools for ${cat} and learn basic syntax.` },
      { title: "Core Concepts", desc: `Deep dive into ${cat} fundamentals and primary modules.` },
    ];
    if (dur === "short") {
      steps.push({ title: "Quick Project", desc: "Build a mini-application to apply your knowledge." });
    } else if (dur === "medium") {
      steps.push({ title: "Intermediate Build", desc: "Develop a functional portfolio project." });
      steps.push({ title: "Final Assessment", desc: "Complete a comprehensive skill test." });
    } else {
      steps.push({ title: "Advanced Architecture", desc: "Master scaling and industry standards." });
      steps.push({ title: "Real-world Deployment", desc: "Deploy a full-scale app to production." });
      steps.push({ title: "Specialization", desc: "Focus on industry-specific use cases." });
    }
    return steps;
  };

  const roadmap = generateRoadmap(course);

  return (
    <div 
      className={`result-card-container ${isFlipped ? 'is-flipped is-expanded' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="result-card-inner">
        {/* FRONT FACE */}
        <div className="result-card-front">
          <div className="card-rank">{rank}</div>
          <div className="card-body">
            <div className="card-title">
              {CATEGORY_EMOJI[course.category.toLowerCase()] || "📚"} {course.title}
            </div>
            <div className="card-meta">
              <span className="badge badge-category">{course.category}</span>
              <span className="badge badge-level">{course.level}</span>
              <span className="badge badge-duration">⏱ {course.duration}</span>
              <span className="badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--clr-text)' }}>
                🏢 {course.platform}
              </span>
            </div>
            <div className="card-links" style={{ margin: '12px 0' }}>
              <a 
                href={course.course_link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                   background: 'white',
                   color: '#121428',
                   padding: '8px 16px',
                   borderRadius: '8px',
                   boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
                 }}
              >
                🔗 View Course
              </a>
            </div>
            <div className="card-rating" style={{ color: '#d97706' }}>
              {stars} <span style={{ color: 'var(--clr-text)', marginLeft: '4px' }}>{course.rating}</span>
            </div>
            <div className="card-tags" style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '5px' }}>
              Click to see study roadmap →
            </div>
          </div>
          <div className="card-similarity">
            <div className="sim-ring" style={{ '--pct': simPct }}>
              <span className="sim-value">{simPct}%</span>
            </div>
            <span className="sim-label">Match</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="result-card-back">
          <div className="roadmap-title">📚 Study Roadmap: {course.title}</div>
          <div className="roadmap-container">
            <div className="timeline">
              {roadmap.map((step, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="back-footer">
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href={course.youtube_tamil} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.7rem',
                  background: 'rgba(255,0,0,0.1)',
                  color: '#ff4d4d',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,0,0,0.2)'
                }}
              >
                🇮🇳 Tamil YT
              </a>
              <a 
                href={course.youtube_english} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.7rem',
                  background: 'rgba(255,0,0,0.1)',
                  color: '#ff4d4d',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,0,0,0.2)'
                }}
              >
                🇺🇸 English YT
              </a>
            </div>
            <button 
              className="close-details"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              style={{
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-muted)',
                fontSize: '0.7rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'transparent'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
