let selectedSymptoms = [];
let highlightedIndex = -1;
let suggestionsList = [];

const BASE_PATH = window.location.pathname.includes('/MediMind') 
  ? '/MediMind--------Symptom-based-disease-matching-webapp'
  : '';

const IS_GITHUB_PAGES = window.location.hostname === 'nandanhs006.github.io' || 
                         window.location.hostname.includes('github.io');

const API_BASE_URL = IS_GITHUB_PAGES ? null : window.location.origin + "/api";

function getPath(path) {
  return BASE_PATH + path;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('toggleBtn');
  const sidebar = document.querySelector('.sidebar');

  if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      btn.innerHTML = sidebar.classList.contains('collapsed') ? '>' : '<';
    });
  }

  const inputEl = document.getElementById("symptoms");

  if (inputEl) {
    inputEl.addEventListener("keydown", (event) => {
      const suggestionItems = document.querySelectorAll("#suggestions li");

      if (!suggestionItems.length) return;

      if (event.key === "ArrowDown") {
        highlightedIndex = (highlightedIndex + 1) % suggestionItems.length;
      } else if (event.key === "ArrowUp") {
        highlightedIndex = (highlightedIndex - 1 + suggestionItems.length) % suggestionItems.length;
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (suggestionsList[highlightedIndex]) {
          addSymptom(suggestionsList[highlightedIndex]);
        }
      }

      suggestionItems.forEach((el, i) => {
        el.classList.toggle("active", i === highlightedIndex);
      });
    });
  }

  if (document.getElementById("results")) {
    loadResults();
  }
});

async function handleInput() {
  const query = document.getElementById("symptoms").value;

  if (!query) {
    closeSuggestions();
    return;
  }

  if (IS_GITHUB_PAGES) {
    console.warn("API not available on GitHub Pages. Please deploy to a server with a backend.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/symptoms?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    suggestionsList = data;
    highlightedIndex = -1;

    displaySuggestions(data, query);

  } catch (err) {
    console.error('Failed to fetch suggestions:', err);
  }
}

function displaySuggestions(data, query) {
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!data.length) {
    const emptyItem = document.createElement("li");
    emptyItem.innerText = "No results found";
    emptyItem.style.opacity = "0.6";
    suggestions.appendChild(emptyItem);
    return;
  }

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlightRegex = new RegExp(`(${escapeRegex(query)})`, "gi");

  data.forEach((symptom, index) => {
    const item = document.createElement("li");

    item.innerHTML = symptom.replace(highlightRegex, "<strong>$1</strong>");
    item.onclick = () => addSymptom(symptom);

    if (index === highlightedIndex) {
      item.classList.add("active");
    }

    suggestions.appendChild(item);
  });
}

function closeSuggestions() {
  const el = document.getElementById("suggestions");
  if (el) el.innerHTML = "";
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".input-box")) {
    closeSuggestions();
  }
});

function addSymptom(symptom) {
  if (selectedSymptoms.includes(symptom)) return;

  selectedSymptoms.push(symptom);
  buildSymptomTags();

  document.getElementById("symptoms").value = "";
  closeSuggestions();
}

function deleteSymptom(symptom) {
  selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
  buildSymptomTags();
}

function buildSymptomTags() {
  const container = document.getElementById("selected-symptoms");
  if (!container) return;

  container.innerHTML = "";

  selectedSymptoms.forEach(symptom => {
    const tag = document.createElement("div");
    tag.className = "tag";

    tag.innerHTML = `
      ${symptom} <span onclick="deleteSymptom('${symptom}')">×</span>
    `;

    container.appendChild(tag);
  });
}

function goToResults() {
  if (!selectedSymptoms.length) {
    alert("Select at least one symptom");
    return;
  }

  localStorage.setItem("symptoms", selectedSymptoms.join(","));
  window.location.href = "result.html";
}

async function loadResults() {
  const resultsEl = document.getElementById("results");
  if (!resultsEl) return;

  const symptomsString = localStorage.getItem("symptoms") || "";
  const symptoms = symptomsString
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!symptoms.length) {
    resultsEl.innerHTML = "<div style='text-align: center; color: #999; padding: 40px;'>No symptoms selected. Please go back and try again.</div>";
    return;
  }

  if (IS_GITHUB_PAGES) {
    resultsEl.innerHTML = "<div style='text-align: center; color: red; padding: 40px;'><strong>⚠️ Demo Mode:</strong> Backend API not available on GitHub Pages. Please deploy this project to a server with a Node.js backend to get real results.</div>";
    return;
  }

  resultsEl.innerHTML = "<div style='text-align: center; color: #999; padding: 40px;'>Loading results...</div>";

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || data.message || "Failed to fetch prediction results";
      resultsEl.innerHTML = `<div style='text-align: center; color: red; padding: 40px;'>${errorMsg}</div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      resultsEl.innerHTML = "<div style='text-align: center; color: #999; padding: 40px;'>No matching diseases found.</div>";
      return;
    }

    // Separate top match from other matches
    const topMatch = data.find(item => item.isTopMatch);
    const otherMatches = data.filter(item => !item.isTopMatch);

    let resultsHTML = '';

    // Display top match prominently
    if (topMatch) {
      const diseaseDetails = getDiseaseData(topMatch.name);
      const confidence = parseFloat(topMatch.match || topMatch.confidence || 0);
      const confidenceLevel = topMatch.severity || 'MODERATE';
      const badgeColor = '#ffc107';
      const borderColor = '#FF6B6B';
      const barColor = '#00BCD4';
      const cardBg = 'linear-gradient(135deg, rgba(20, 40, 80, 0.8), rgba(30, 60, 100, 0.8))';

      resultsHTML += `
        <div style="background: ${cardBg}; border: 3px solid ${borderColor}; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); transform: scale(1.02);">
          <div style="text-align: center; margin-bottom: 15px;">
            <span style="background: ${badgeColor}; color: #333; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: bold; text-transform: uppercase; display: inline-block;">
              MOST LIKELY MATCH
            </span>
          </div>
          
          <h2 style="color: #FFFFFF; margin: 15px 0; font-size: 42px; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
            ${topMatch.name}
          </h2>
          
          <div style="text-align: center; margin: 20px 0;">
            <div style="background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden; height: 12px; max-width: 400px; margin: 0 auto 10px;">
              <div style="background: ${barColor}; height: 100%; width: ${confidence}%; transition: width 0.5s ease;"></div>
            </div>
            <p style="color: #FFFFFF; font-size: 18px; margin: 0; font-weight: bold;">
              ${confidence.toFixed(0)}% MATCH CONFIDENCE
            </p>
            <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 5px 0 0 0;">
              Level: <strong>${confidenceLevel}</strong>
            </p>
          </div>

          <p style="color: #FFFFFF; font-size: 16px; line-height: 1.6; margin: 20px 0; text-align: center;">${diseaseDetails.description || 'N/A'}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
            <div>
              <p style="color: #FFFFFF; font-size: 13px; margin-bottom: 8px;"><strong>Key Symptoms:</strong></p>
              <p style="color: rgba(255,255,255,0.9); font-size: 12px;">${diseaseDetails.symptoms ? diseaseDetails.symptoms.slice(0, 4).join(', ') : 'N/A'}</p>
            </div>
            <div>
              <p style="color: #FFFFFF; font-size: 13px; margin-bottom: 8px;"><strong>Treatment Options:</strong></p>
              <p style="color: rgba(255,255,255,0.9); font-size: 12px;">${diseaseDetails.treatments ? diseaseDetails.treatments.slice(0, 3).join('; ') : 'N/A'}</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <a href="../pages/library.html?disease=${encodeURIComponent(topMatch.name)}" style="background: ${badgeColor}; color: #333; text-decoration: none; font-weight: bold; padding: 12px 30px; border-radius: 25px; font-size: 14px; display: inline-block; transition: 0.3s;">
              View Full Details
            </a>
          </div>
        </div>
      `;
    }

    // Display other matches as secondary options
    if (otherMatches.length > 0) {
      resultsHTML += `
        <h3 style="color: #FFFFFF; margin: 30px 0 20px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">
          Other Possible Matches
        </h3>
      `;

      resultsHTML += otherMatches
        .map((item) => {
          const diseaseDetails = getDiseaseData(item.name);
          const confidenceLevel = item.severity || 'MODERATE';
          const confidence = parseFloat(item.match || item.confidence || 0);
          
          let badgeColor = '#ffc107';

          return `
            <div class="card" style="border-left: 4px solid ${badgeColor}; opacity: 0.85;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h3 style="color: #FFFFFF; margin: 0; font-size: 16px;">${item.name}</h3>
                <span style="background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                  ${confidence.toFixed(0)}%
                </span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <div style="background: #2a2a2a; border-radius: 4px; overflow: hidden; height: 5px;">
                  <div style="background: ${badgeColor}; height: 100%; width: ${confidence}%;"></div>
                </div>
              </div>

              <p style="color: #FFFFFF; font-size: 12px; line-height: 1.4; margin-bottom: 10px;">${diseaseDetails.description ? diseaseDetails.description.substring(0, 120) + '...' : 'N/A'}</p>
              
              <p style="color: #FFFFFF; font-size: 11px; margin-bottom: 10px;"><strong>Key Symptoms:</strong> ${diseaseDetails.symptoms ? diseaseDetails.symptoms.slice(0, 3).join(', ') : 'N/A'}</p>

              <div style="margin-top: 10px;">
                <a href="../pages/library.html?disease=${encodeURIComponent(item.name)}" style="color: #00bfff; text-decoration: none; font-weight: 600; font-size: 11px;">
                  View details →
                </a>
              </div>
            </div>
          `;
        })
        .join("");
    }

    resultsEl.innerHTML = resultsHTML;
  } catch (err) {
    console.error('Failed to load results:', err);
    resultsEl.innerHTML = "<div style='text-align: center; color: red; padding: 40px;'>Error loading results. Please try again.</div>";
  }
}