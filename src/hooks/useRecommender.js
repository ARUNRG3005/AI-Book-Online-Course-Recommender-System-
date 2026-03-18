import { useMemo } from 'react';
import { COURSES, GOAL_KEYWORDS } from '../data/courses';

function tokenise(text) {
  const STOP = new Set(["the", "a", "an", "and", "or", "is", "in", "of", "to", "for", "with", "on", "at", "by", "from", "as", "this", "that", "are", "was", "be"]);
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 1 && !STOP.has(w));
}

function buildTFIDF(docs) {
  const N = docs.length;
  const tfList = docs.map(tokens => {
    const tf = {};
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    const len = tokens.length || 1;
    Object.keys(tf).forEach(k => tf[k] /= len);
    return tf;
  });
  const df = {};
  tfList.forEach(tf => Object.keys(tf).forEach(k => { df[k] = (df[k] || 0) + 1; }));
  const vocab = Object.keys(df).filter(k => df[k] < N);
  const vectors = tfList.map(tf => vocab.map(k => (tf[k] || 0) * Math.log((N + 1) / (df[k] || 1) + 1)));
  return { vocab, vectors };
}

function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function useRecommender() {
  const recommend = (prefs, topN = 5) => {
    const { topic, level, goal, duration } = prefs;
    const corpus = COURSES.map(c => `${c.tags} ${c.category} ${c.level} ${c.duration}`);
    const goalKW = GOAL_KEYWORDS[goal.toLowerCase()] || goal;
    const query = `${topic} ${topic} ${level} ${duration} ${goalKW}`;
    
    const corpusTokens = corpus.map(tokenise);
    const queryTokens = tokenise(query);
    
    const { vectors } = buildTFIDF([...corpusTokens, queryTokens]);
    const courseVecs = vectors.slice(0, COURSES.length);
    const queryVec = vectors[COURSES.length];
    
    const scored = COURSES.map((course, i) => {
      let score = cosineSim(queryVec, courseVecs[i]);
      // Boosts
      if (course.category.toLowerCase() === topic.toLowerCase()) score += 0.30;
      if (course.level.toLowerCase() === level.toLowerCase()) score += 0.20;
      if (course.duration.toLowerCase() === duration.toLowerCase()) score += 0.15;
      
      return { ...course, score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score || b.rating - a.rating)
      .slice(0, topN)
      .map(c => ({
        ...c,
        similarity: Math.min(Math.round(c.score * 100), 99)
      }));
  };

  return { recommend };
}
