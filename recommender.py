"""
recommender.py — Content-Based Recommendation Engine
=====================================================
Algorithm: Content-Based Filtering using TF-IDF + Cosine Similarity

HOW IT WORKS (beginner explanation):
--------------------------------------
1. Each course in the dataset has a text description: its tags, category, level, duration.
2. We convert these into numeric vectors using TF-IDF (each word becomes a number dimension).
3. The user's preferences are converted into the SAME vector space.
4. We measure the ANGLE between the user vector and each course vector.
   - A small angle (cosine similarity close to 1.0) = very similar
   - A large angle (cosine similarity close to 0.0) = very different
5. We sort courses by similarity score and return the top N.

This is exactly how Netflix, Spotify, and YouTube recommend content!
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from preprocess import load_dataset, build_combined_text, build_tfidf_matrix

# ─── Goal → keyword mapping ───────────────────────────────────────────────────
GOAL_KEYWORDS = {
    "get a job":          "career job interview skills practical",
    "improve skills":     "improve skills practice projects hands-on",
    "academic learning":  "academic theory fundamentals research study",
}

# ─── Topic → category mapping (normalise user input) ─────────────────────────
TOPIC_MAP = {
    "ai":               "ai",
    "artificial intelligence": "ai",
    "programming":      "programming",
    "data science":     "data science",
    "web development":  "web development",
    "cybersecurity":    "cybersecurity",
    "cyber security":   "cybersecurity",
}


def _build_user_query(user_prefs: dict) -> str:
    """
    Convert user preferences dict into a single query string
    that can be fed into the same TF-IDF vectorizer.

    Parameters
    ----------
    user_prefs : dict
        Keys: topic, level, goal, duration

    Returns
    -------
    str — concatenated query string
    """
    topic    = TOPIC_MAP.get(user_prefs.get("topic", "").lower(), user_prefs.get("topic", ""))
    level    = user_prefs.get("level", "").lower()
    goal     = user_prefs.get("goal", "").lower()
    duration = user_prefs.get("duration", "").lower()

    goal_keywords = GOAL_KEYWORDS.get(goal, goal)

    # Build a rich query string by repeating the topic (boosts its weight)
    query = f"{topic} {topic} {level} {duration} {goal_keywords}"
    return query


def recommend(user_prefs: dict, top_n: int = 5) -> list[dict]:
    """
    Main recommendation function.

    Parameters
    ----------
    user_prefs : dict
        {
          "topic":    "AI" | "Programming" | "Data Science" | "Web Development" | "Cybersecurity",
          "level":    "Beginner" | "Intermediate" | "Advanced",
          "goal":     "Get a job" | "Improve skills" | "Academic learning",
          "duration": "Short" | "Medium" | "Long"
        }
    top_n : int
        Number of recommendations to return (default 5)

    Returns
    -------
    list[dict]  — top-N courses sorted by similarity + rating
    """
    # ── Step 1: Load and prepare dataset ──────────────────────────────────────
    df = load_dataset()
    combined_text = build_combined_text(df)
    tfidf_matrix, vectorizer = build_tfidf_matrix(combined_text)

    # ── Step 2: Build the user query vector ───────────────────────────────────
    user_query = _build_user_query(user_prefs)
    # Transform query into the same TF-IDF vector space (1 × n_features matrix)
    user_vector = vectorizer.transform([user_query])

    # ── Step 3: Compute cosine similarity ─────────────────────────────────────
    # similarity[i] = how closely course i matches the user's preferences (0–1)
    similarity_scores = cosine_similarity(user_vector, tfidf_matrix).flatten()

    # ── Step 4: Apply a hard filter on level and duration for better UX ───────
    topic_normalized    = TOPIC_MAP.get(user_prefs.get("topic", "").lower(), "")
    level_normalized    = user_prefs.get("level", "").lower().strip()
    duration_normalized = user_prefs.get("duration", "").lower().strip()

    # Boost scores for items that EXACTLY match level and duration
    for i, row in df.iterrows():
        if row["level"] == level_normalized:
            similarity_scores[i] += 0.15          # level match bonus
        if row["category"] == topic_normalized:
            similarity_scores[i] += 0.20          # category match bonus (strongest)
        if row["duration"] == duration_normalized:
            similarity_scores[i] += 0.10          # duration match bonus

    # ── Step 5: Sort by similarity then by rating ─────────────────────────────
    df = df.copy()
    df["similarity"] = similarity_scores
    df_sorted = df.sort_values(
        by=["similarity", "rating"],
        ascending=[False, False]
    ).reset_index(drop=True)

    # ── Step 6: Return the top-N results as a list of dicts ──────────────────
    top_courses = df_sorted.head(top_n)
    results = []
    for _, row in top_courses.iterrows():
        results.append({
            "title":           row["title"].title(),
            "category":        row["category"].title(),
            "level":           row["level"].title(),
            "duration":        row["duration"].title(),
            "rating":          round(float(row["rating"]), 1),
            "platform":        row["platform"],
            "course_link":     row["course_link"],
            "youtube_tamil":   row["youtube_tamil"],
            "youtube_english": row["youtube_english"],
            "tags":            row["tags"],
            "similarity":      round(float(row["similarity"]), 3),
        })

    return results
