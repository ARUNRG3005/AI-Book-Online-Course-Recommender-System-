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
   STUDY ROADMAP GENERATOR
   ════════════════════════════════════════════════════════════════════════ */
function generateRoadmap(course) {
  const dur = course.duration.toLowerCase();
  const cat = course.category.toLowerCase();
  
  const steps = [
    { title: "Foundation & Setup", desc: `Install required tools for ${cat} and learn the basic syntax/theory.` },
    { title: "Core Concepts", desc: `Deep dive into ${escapeHTML(course.tags.split(' ')[0])} and primary modules.` },
  ];

  if (dur === "short") {
    steps.push({ title: "Quick Project", desc: "Build a mini-application to apply what you've learned." });
    steps.push({ title: "Review & Cert", desc: "Final recap and claim your basic certificate." });
  } else if (dur === "medium") {
    steps.push({ title: "Intermediate Modules", desc: "Explore complex patterns, libraries, and real-world use cases." });
    steps.push({ title: "Capstone Project", desc: "Develop a functional portfolio project with documentation." });
    steps.push({ title: "Final Assessment", desc: "Test your skills with a comprehensive exam." });
  } else {
    steps.push({ title: "Advanced Architecture", desc: "Master scaling, optimization, and advanced industry standards." });
    steps.push({ title: "Real-world Deployment", desc: "Deploy a full-scale application to a production environment." });
    steps.push({ title: "Industry Specialization", desc: "Focus on a niche area and prepare for professional interviews." });
  }
  
  return steps;
}

/* ══════════════════════════════════════════════════════════════════════════
   RENDER RESULTS
   ════════════════════════════════════════════════════════════════════════ */
function renderResults(recommendations, prefs) {
  resultsGrid.innerHTML = "";

  const topicDisplay = prefs.topic || "your interests";
  resultsSummary.textContent =
    `Top ${recommendations.length} picks for ${topicDisplay} · ${prefs.level} · ${prefs.duration} course`;

  recommendations.forEach((course, index) => {
    const cardContainer = buildCard(course, index + 1);
    resultsGrid.appendChild(cardContainer);
    cardContainer.style.animationDelay = `${index * 0.1}s`;
    
    // Toggle Flip & Expand on Click
    cardContainer.addEventListener("click", function(e) {
      if (e.target.tagName === 'A') return; // Don't flip if clicking a link
      
      const isExpanded = this.classList.contains('is-expanded');
      
      // Close all other expanded cards
      document.querySelectorAll('.result-card-container').forEach(c => {
        c.classList.remove('is-expanded', 'is-flipped');
      });
      
      if (!isExpanded) {
        this.classList.add('is-expanded', 'is-flipped');
        setTimeout(() => {
          this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  });

  resultsSection.classList.remove("hidden");
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

/* ── Build a single recommendation card (3D Flip Structure) ─────────────── */
function buildCard(course, rank) {
  const container = document.createElement("div");
  container.className = "result-card-container";

  const simPct   = Math.min(Math.round((course.similarity || 0) * 100), 100);
  const simLabel = `${simPct}%`;
  const stars    = buildStars(course.rating);
  const emoji    = CATEGORY_EMOJI[course.category.toLowerCase()] || "📚";
  const tagList  = (course.tags || "").split(" ").slice(0, 6).join(" · ");
  const roadmap  = generateRoadmap(course);

  const roadmapHTML = roadmap.map(step => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <h4>${step.title}</h4>
        <p>${step.desc}</p>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="result-card-inner">
      <!-- FRONT FACE -->
      <div class="result-card-front">
        <div class="card-rank">${rank}</div>
        <div class="card-body">
          <div class="card-title">${emoji} ${escapeHTML(course.title)}</div>
          <div class="card-meta">
            <span class="badge badge-category">${escapeHTML(course.category)}</span>
            <span class="badge badge-level">${escapeHTML(course.level)}</span>
            <span class="badge badge-duration">⏱ ${escapeHTML(course.duration)}</span>
            <span class="badge" style="background: rgba(255,255,255,0.1); color: #fff;">🏢 ${escapeHTML(course.platform)}</span>
          </div>
          
          <div class="card-links" style="margin: 12px 0; display: flex; flex-wrap: wrap; gap: 8px;">
            <a href="${course.course_link}" target="_blank" style="text-decoration: none; font-size: 0.8rem; font-weight: 700; background: var(--grad-primary); color: #fff; padding: 6px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">🔗 View Course</a>
          </div>

          <div class="card-rating">
            ${stars} <span style="color:#e8eaf6;margin-left:4px;">${course.rating}</span>
          </div>
          <div class="card-tags" style="font-size: 0.7rem; color: var(--clr-muted); margin-top: 5px;">
            Click to see study roadmap →
          </div>
        </div>
        <div class="card-similarity">
          <div class="sim-ring" style="--pct:${simPct}">
            <span class="sim-value">${simLabel}</span>
          </div>
          <span class="sim-label">Match</span>
        </div>
      </div>

      <!-- BACK FACE -->
      <div class="result-card-back">
        <div class="roadmap-title">
          <span>📍</span> Study Roadmap: ${escapeHTML(course.title)}
        </div>
        <div class="roadmap-container">
          <div class="timeline">
            ${roadmapHTML}
          </div>
        </div>
        <div class="back-footer">
          <div class="card-links" style="display: flex; gap: 8px;">
            <a href="${course.youtube_tamil}" target="_blank" style="text-decoration: none; font-size: 0.75rem; font-weight: 500; border: 1px solid rgba(255,0,0,0.4); background: rgba(255,0,0,0.1); color: #ff4d4d; padding: 5px 10px; border-radius: 6px;">🇮🇳 Tamil YT</a>
            <a href="${course.youtube_english}" target="_blank" style="text-decoration: none; font-size: 0.75rem; font-weight: 500; border: 1px solid rgba(255,0,0,0.4); background: rgba(255,0,0,0.1); color: #ff4d4d; padding: 5px 10px; border-radius: 6px;">🇺🇸 English YT</a>
          </div>
          <button class="close-details">Close Details</button>
        </div>
      </div>
    </div>
  `;

  return container;
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
