"""
preprocess.py — Data Loading & Feature Engineering
===================================================
This module handles:
  1. Loading the courses.csv dataset using pandas
  2. Cleaning/filling missing values
  3. Building a combined text feature string per course
  4. Creating TF-IDF vectors for content-based filtering

BEGINNER EXPLANATION:
  - TF-IDF (Term Frequency-Inverse Document Frequency) turns words into numbers.
  - A course with words like "python beginner machine learning" gets a numeric vector.
  - We can then compare two vectors using cosine similarity to find similar courses.
"""

import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "courses.csv")


def load_dataset() -> pd.DataFrame:
    """
    Load and clean the courses CSV file.

    Returns
    -------
    pd.DataFrame
        Cleaned DataFrame with at least the columns:
        id, title, category, level, duration, rating, tags
    """
    df = pd.read_csv(DATASET_PATH)

    # Fill any missing text values with an empty string
    text_cols = ["title", "category", "level", "duration", "tags"]
    for col in text_cols:
        df[col] = df[col].fillna("").str.strip().str.lower()

    # Fill numeric values with the column mean
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(df["rating"].mean())

    return df


def build_combined_text(df: pd.DataFrame) -> pd.Series:
    """
    Combine relevant text columns into a single string per course.

    We concatenate: tags + category + level + duration
    This gives the TF-IDF vectorizer rich context about each course.

    Example combined string:
        "python beginner machine learning ai beginner short"

    Parameters
    ----------
    df : pd.DataFrame

    Returns
    -------
    pd.Series of combined strings (one per course row)
    """
    combined = (
        df["tags"] + " "
        + df["category"] + " "
        + df["level"] + " "
        + df["duration"]
    )
    return combined


def build_tfidf_matrix(combined_text: pd.Series):
    """
    Fit a TF-IDF vectorizer on the combined course text and transform it.

    Parameters
    ----------
    combined_text : pd.Series

    Returns
    -------
    tfidf_matrix  : sparse matrix (n_courses × n_features)
    vectorizer    : fitted TfidfVectorizer (needed to transform user query)
    """
    vectorizer = TfidfVectorizer(
        stop_words="english",   # ignore common words like "the", "is"
        ngram_range=(1, 2),     # capture single words AND two-word phrases
        max_features=500        # keep only the top 500 most informative words
    )
    tfidf_matrix = vectorizer.fit_transform(combined_text)
    return tfidf_matrix, vectorizer
