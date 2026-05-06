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

    resultsEl.innerHTML = data
      .map((item) => {
        const diseaseDetails = getDiseaseData(item.name);
        return `
          <div class="card">
            <h3 style="color: #FFFFFF; margin-bottom: 8px;">${item.name}</h3>
            <p style="color: #FFFFFF; font-size: 12px; margin-bottom: 12px;">Match Confidence: <strong>${item.match}%</strong></p>
            <p style="color: #FFFFFF; font-size: 13px; line-height: 1.5; margin-bottom: 10px;">${diseaseDetails.description || 'N/A'}</p>
            <p style="color: #FFFFFF; font-size: 12px; margin-bottom: 10px;"><strong>Key Symptoms:</strong> ${diseaseDetails.symptoms ? diseaseDetails.symptoms.slice(0, 3).join(', ') : 'N/A'}</p>
            <a href="../pages/library.html?disease=${encodeURIComponent(item.name)}" style="color: #FFFFFF; text-decoration: underline; font-weight: 600; font-size: 12px;">View details →</a>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error('Failed to load results:', err);
    resultsEl.innerHTML = "<div style='text-align: center; color: red; padding: 40px;'>Unable to reach server. Please try again.</div>";
  }
}