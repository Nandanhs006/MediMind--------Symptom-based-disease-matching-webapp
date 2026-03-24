let selectedSymptoms = [];
let currentIndex = -1;
let currentSuggestions = [];
const API_BASE_URL = "http://localhost:5000/api";

async function handleInput() {
  const query = document.getElementById("symptoms").value;

  if (!query) {
    closeSuggestions();
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/symptoms?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    currentSuggestions = data;
    currentIndex = -1;

    renderSuggestions(data, query);

  } catch (err) {
    console.error(err);
  }
}

function renderSuggestions(data, query) {
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!data.length) {
    const li = document.createElement("li");
    li.innerText = "No results found";
    li.style.opacity = "0.6";
    suggestions.appendChild(li);
    return;
  }

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, "gi");

  data.forEach((symptom, index) => {
    const li = document.createElement("li");

    li.innerHTML = symptom.replace(regex, "<strong>$1</strong>");
    li.onclick = () => addSymptom(symptom);

    if (index === currentIndex) {
      li.classList.add("active");
    }

    suggestions.appendChild(li);
  });
}

function closeSuggestions() {
  document.getElementById("suggestions").innerHTML = "";
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".input-box")) {
    closeSuggestions();
  }
});

const inputEl = document.getElementById("symptoms");

if (inputEl) {
  inputEl.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll("#suggestions li");

    if (!items.length) return;

    if (e.key === "ArrowDown") {
      currentIndex = (currentIndex + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentSuggestions[currentIndex]) {
        addSymptom(currentSuggestions[currentIndex]);
      }
    }

    items.forEach((el, i) => {
      el.classList.toggle("active", i === currentIndex);
    });
  });
}


function addSymptom(symptom) {
  if (selectedSymptoms.includes(symptom)) return;

  selectedSymptoms.push(symptom);
  renderTags();

  document.getElementById("symptoms").value = "";
  closeSuggestions();
}

function removeSymptom(symptom) {
  selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
  renderTags();
}

function renderTags() {
  const container = document.getElementById("selected-symptoms");
  if (!container) return;

  container.innerHTML = "";

  selectedSymptoms.forEach(symptom => {
    const tag = document.createElement("div");
    tag.className = "tag";

    tag.innerHTML = `
      ${symptom} <span onclick="removeSymptom('${symptom}')">×</span>
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
    resultsEl.innerHTML = "<li>No symptoms selected. Please go back and try again.</li>";
    return;
  }

  resultsEl.innerHTML = "<li>Loading results...</li>";

  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data.error || data.message || "Failed to fetch prediction results";
      resultsEl.innerHTML = `<li>${message}</li>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      resultsEl.innerHTML = "<li>No matching diseases found.</li>";
      return;
    }

    resultsEl.innerHTML = data
      .map((item) => `<li><strong>${item.name}</strong> - Match: ${item.match}%</li>`)
      .join("");
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "<li>Unable to reach server. Please try again.</li>";
  }
}

if (document.getElementById("results")) {
  window.onload = loadResults;
}