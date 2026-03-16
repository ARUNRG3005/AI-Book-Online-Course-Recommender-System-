"""
app.py — Flask Backend API
==========================
This is the main entry point of the web application.

It serves:
  GET  /          → The HTML frontend (index.html)
  GET  /courses   → Return all courses as JSON
  POST /recommend → Accept user preferences and return top-N recommendations

HOW TO RUN:
  pip install -r requirements.txt
  python app.py

Then open: http://127.0.0.1:5000
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from preprocess import load_dataset
from recommender import recommend

# ─── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (important for local dev)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main frontend HTML page."""
    return render_template("index.html")


@app.route("/courses", methods=["GET"])
def get_courses():
    """
    GET /courses
    Returns all courses from the dataset as a JSON array.

    Example response:
    [
      { "id": 1, "title": "AI Fundamentals", "category": "AI", ... },
      ...
    ]
    """
    df = load_dataset()
    # Convert each row to a plain Python dict (JSON-serialisable)
    courses = df.to_dict(orient="records")
    # Capitalise titles and categories for nice display
    for c in courses:
        c["title"]    = str(c["title"]).title()
        c["category"] = str(c["category"]).title()
        c["level"]    = str(c["level"]).title()
        c["duration"] = str(c["duration"]).title()
    return jsonify({"total": len(courses), "courses": courses})


@app.route("/recommend", methods=["POST"])
def get_recommendations():
    """
    POST /recommend
    Accepts user preferences as JSON and returns top-5 recommendations.

    Request body (JSON):
    {
      "topic":    "AI",
      "level":    "Beginner",
      "goal":     "Get a job",
      "duration": "Short"
    }

    Response (JSON):
    {
      "recommendations": [
        {
          "title":      "Ai Fundamentals",
          "category":   "Ai",
          "level":      "Beginner",
          "duration":   "Short",
          "rating":     4.7,
          "tags":       "artificial intelligence basics introduction",
          "similarity": 0.82
        },
        ...
      ]
    }
    """
    data = request.get_json()

    # ── Validate required fields ──────────────────────────────────────────────
    required_fields = ["topic", "level", "goal", "duration"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({
            "error": f"Missing fields: {', '.join(missing)}"
        }), 400

    user_prefs = {
        "topic":    data["topic"],
        "level":    data["level"],
        "goal":     data["goal"],
        "duration": data["duration"],
    }

    # ── Run the recommendation engine ─────────────────────────────────────────
    results = recommend(user_prefs, top_n=5)

    return jsonify({
        "query": user_prefs,
        "recommendations": results
    })


# ─── Error Handlers ───────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error", "details": str(e)}), 500


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  AI Book & Course Recommender System")
    print("  Server running at: http://127.0.0.1:5000")
    print("  Press Ctrl+C to stop")
    print("=" * 60)
    app.run(debug=True, host="0.0.0.0", port=5000)
