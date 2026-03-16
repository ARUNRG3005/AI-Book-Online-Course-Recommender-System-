/**
 * app.js — AI Learning Recommender Frontend Logic
 * ================================================
 * Responsibilities:
 *  1. Collect user inputs from the form
 *  2. Validate all fields before submitting
 *  3. POST preferences to the Flask /recommend endpoint
 *  4. Render recommendation cards with staggered animations
 *  5. Handle loading states and errors gracefully
 *
 * BEGINNER EXPLANATION:
 *  - We use the Fetch API (built-in to all modern browsers) instead of page reloads.
 *  - This means the page never refreshes — results appear instantly via JavaScript.
 *  - This technique is called an "AJAX request" or "async API call".
 */

/* ── DOM element references ─────────────────────────────────────────────── */
const form           = document.getElementById("recommendForm");
const submitBtn      = document.getElementById("submitBtn");
const btnText        = submitBtn.querySelector(".btn-text");
const spinner        = document.getElementById("spinner");
const resultsSection = document.getElementById("resultsSection");
const resultsGrid    = document.getElementById("resultsGrid");
const resultsSummary = document.getElementById("resultsSummary");
const retryBtn       = document.getElementById("retryBtn");
const errorBox       = document.getElementById("errorBox");
const errorMessage   = document.getElementById("errorMessage");

/* ── Category emoji lookup ────────────────────────────────────────────── */
const CATEGORY_EMOJI = {
  "ai":               "🤖",
  "programming":      "💻",
  "data science":     "📊",
  "web development":  "🌐",
  "cybersecurity":    "🔐",
};

/* ══════════════════════════════════════════════════════════════════════════
   FORM SUBMISSION HANDLER
   ════════════════════════════════════════════════════════════════════════ */
form.addEventListener("submit", async (event) => {
  event.preventDefault();  // Prevent default browser form submission (page reload)

  // ── 1. Read form values ───────────────────────────────────────────────
  const topic    = document.getElementById("topic").value;
  const levelEl  = document.querySelector('input[name="level"]:checked');
  const goalEl   = document.querySelector('input[name="goal"]:checked');
  const durEl    = document.querySelector('input[name="duration"]:checked');

  const level    = levelEl    ? levelEl.value    : "";
  const goal     = goalEl     ? goalEl.value     : "";
  const duration = durEl      ? durEl.value      : "";

  // ── 2. Validate ───────────────────────────────────────────────────────
  const errors = validateInputs({ topic, level, goal, duration });
  if (Object.keys(errors).length > 0) {
    showFieldErrors(errors);
    return;
  }
  clearFieldErrors();

  // ── 3. Set loading state ──────────────────────────────────────────────
  setLoading(true);
  hideError();
  hideResults();

  // ── 4. Call the Flask API ─────────────────────────────────────────────
  try {
    const response = await fetch("/recommend", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ topic, level, goal, duration }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error (${response.status})`);
    }

    const data = await response.json();

    // ── 5. Render the results ─────────────────────────────────────────
    if (data.recommendations && data.recommendations.length > 0) {
      renderResults(data.recommendations, { topic, level, goal, duration });
    } else {
      showError("No recommendations found. Try different preferences!");
    }

  } catch (err) {
    showError(`Could not connect to server: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

/* ── Retry button ────────────────────────────────────────────────────────── */
retryBtn.addEventListener("click", () => {
  hideResults();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ══════════════════════════════════════════════════════════════════════════
   VALIDATION
   ════════════════════════════════════════════════════════════════════════ */
function validateInputs({ topic, level, goal, duration }) {
  const errors = {};
  if (!topic)    errors.topic    = "Please select a topic.";
  if (!level)    errors.level    = "Please choose your skill level.";
  if (!goal)     errors.goal     = "Please choose a learning goal.";
  if (!duration) errors.duration = "Please choose a course length.";
  return errors;
}

function showFieldErrors(errors) {
  ["topic", "level", "goal", "duration"].forEach((field) => {
    const errEl = document.getElementById(`error-${field}`);
    if (errEl) errEl.textContent = errors[field] || "";
  });
}

function clearFieldErrors() {
  ["topic", "level", "goal", "duration"].forEach((field) => {
    const errEl = document.getElementById(`error-${field}`);
    if (errEl) errEl.textContent = "";
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   RENDER RESULTS
   ════════════════════════════════════════════════════════════════════════ */
function renderResults(recommendations, prefs) {
  resultsGrid.innerHTML = "";

  // Update the subtitle
  const topicDisplay = prefs.topic || "your interests";
  resultsSummary.textContent =
    `Top ${recommendations.length} picks for ${topicDisplay} · ${prefs.level} · ${prefs.duration} course`;

  recommendations.forEach((course, index) => {
    const card = buildCard(course, index + 1);
    resultsGrid.appendChild(card);
    // Stagger animation delay — each card appears slightly after the previous
    card.style.animationDelay = `${index * 0.1}s`;
  });

  // Show results section
  resultsSection.classList.remove("hidden");
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

/* ── Build a single recommendation card ─────────────────────────────────── */
function buildCard(course, rank) {
  const card = document.createElement("div");
  card.className = "result-card";

  // Calculate similarity percentage for the ring chart (0.0–1.0 → 0–100%)
  const simPct   = Math.min(Math.round((course.similarity || 0) * 100), 100);
  const simLabel = `${simPct}%`;
  const stars    = buildStars(course.rating);
  const emoji    = CATEGORY_EMOJI[course.category.toLowerCase()] || "📚";
  const tagList  = (course.tags || "").split(" ").slice(0, 6).join(" · ");

  card.innerHTML = `
    <div class="card-rank">${rank}</div>
    <div class="card-body">
      <div class="card-title">${emoji} ${escapeHTML(course.title)}</div>
      <div class="card-meta">
        <span class="badge badge-category">${escapeHTML(course.category)}</span>
        <span class="badge badge-level">${escapeHTML(course.level)}</span>
        <span class="badge badge-duration">⏱ ${escapeHTML(course.duration)}</span>
      </div>
      <div class="card-rating">
        ${stars}
        <span style="color:#e8eaf6;margin-left:4px;">${course.rating}</span>
      </div>
      <div class="card-tags" title="${escapeHTML(course.tags || '')}">
        🏷 ${tagList || "No tags"}
      </div>
    </div>
    <div class="card-similarity">
      <div class="sim-ring" style="--pct:${simPct}">
        <span class="sim-value">${simLabel}</span>
      </div>
      <span class="sim-label">Match</span>
    </div>
  `;

  return card;
}

/* ── Build star rating HTML ──────────────────────────────────────────────── */
function buildStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

/* ── Escape HTML to prevent XSS ─────────────────────────────────────────── */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ══════════════════════════════════════════════════════════════════════════
   UI STATE HELPERS
   ════════════════════════════════════════════════════════════════════════ */
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    btnText.classList.add("hidden");
    spinner.classList.remove("hidden");
  } else {
    submitBtn.disabled = false;
    btnText.classList.remove("hidden");
    spinner.classList.add("hidden");
  }
}

function hideResults() {
  resultsSection.classList.add("hidden");
  resultsGrid.innerHTML = "";
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
  errorMessage.textContent = "";
}
