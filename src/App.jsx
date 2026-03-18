import React, { useState } from 'react';
import Grainient from './components/Grainient';
import Header from './components/Header';
import RecommenderForm from './components/RecommenderForm';
import RecommendationCard from './components/RecommendationCard';
import Footer from './components/Footer';
import { useRecommender } from './hooks/useRecommender';
import './App.css';

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prefs, setPrefs] = useState(null);
  const { recommend } = useRecommender();

  const handleRecommend = (formData) => {
    setIsLoading(true);
    setPrefs(formData);
    
    // Simulate API delay for UX
    setTimeout(() => {
      const results = recommend(formData);
      setRecommendations(results);
      setIsLoading(false);
      
      // Scroll to results
      setTimeout(() => {
        const sect = document.getElementById('resultsSection');
        if (sect) sect.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 800);
  };

  const handleRetry = () => {
    setRecommendations([]);
    setPrefs(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="bg-container">
        <Grainient
          color1="#FF9FFC" // Pink
          color2="#5227FF" // Deep Purple
          color3="#B19EEF" // Light Purple
          timeSpeed={0.2}
          noiseScale={2.0}
          grainAmount={0.1}
          contrast={1.4}
          zoom={0.8}
        />
      </div>

      <div className="app-wrapper">
        <Header />

        <main className="main-container">
          <RecommenderForm onSubmit={handleRecommend} isLoading={isLoading} />

        {recommendations.length > 0 && (
          <section id="resultsSection" className="results-section">
            <div className="results-header">
              <h2 className="results-title">🎯 Recommended for You</h2>
              <p className="results-subtitle">
                Top {recommendations.length} picks for {prefs?.topic} · {prefs?.level} · {prefs?.duration} course
              </p>
            </div>
            
            <div className="results-grid">
              {recommendations.map((course, index) => (
                <RecommendationCard 
                  key={course.id} 
                  course={course} 
                  rank={index + 1} 
                />
              ))}
            </div>

            <button className="btn-retry" onClick={handleRetry}>
              ← Try Again
            </button>
          </section>
        )}
      </main>

      <Footer />
    </div>
    </>
  );
}

export default App;
