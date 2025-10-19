// ===== simple quotes array (starter data) =====
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

// keys for storage
const STORAGE_KEY = "quotes";
const LAST_SHOWN_KEY = "lastShownIndex";

// ===== DOM refs =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const formContainer = document.getElementById("formContainer");

// ===== storage helpers =====
function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save quotes to localStorage:", e);
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return; // nothing stored yet
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // validate minimal structure: objects with text & category
      const valid = parsed.every(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (valid) {
        quotes = parsed;
      } else {
        console.warn("Stored quotes JSON did not match expected shape — ignoring.");
      }
    }
  } catch (e) {
    console.error("Failed to load quotes from localStorage:", e);
  }
}

// session storage: remember last shown quote index (optional demo)
function saveLastShownIndex(idx) {
  try {
    sessionStorage.setItem(LAST_SHOWN_KEY, String(idx));
  } catch (e) { /* ignore */ }
}
function getLastShownIndex() {
  const v = sessionStorage.getItem(LAST_SHOWN_KEY);
  return v === null ? null : Number(v);
}

// ===== core functions =====
function showRandomQuote() {
  if (!quotes || quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  // try to restore last shown index from sessionStorage first
  const lastIdx = getLastShownIndex();
  let index;
  if (lastIdx !== null && lastIdx >= 0 && lastIdx < quotes.length) {
    // show next random but not the same one
    index = Math.floor(Math.random() * quotes.length);
    if (quotes.length > 1 && index === lastIdx) {
      index = (index + 1) % quotes.length;
    }
  } else {
    index = Math.floor(Math.random() * quotes.length);
  }

  const q = quotes[index];
  quoteDisplay.innerHTML = `
    <p>"${escapeHtml(q.text)}"</p>
    <p><em>Category:</em> ${escapeHtml(q.category)}</p>
  `;

  saveLastShownIndex(index);
}

// minimal escaping to avoid breaking display when text contains HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// add a new quote (used by the dynamic form)
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  if (!textEl || !catEl) return;

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (text === "" || category === "") {
    alert("Please fill in both quote and category.");
    return;
  }

  const newQ = { text, category };
  quotes.push(newQ);

  // persist immediately
  saveQuotes();

  // update UI to show the added quote
  quoteDisplay.innerHTML = `
    <p><strong>Added:</strong> "${escapeHtml(newQ.text)}"</p>
    <p><em>Category:</em> ${escapeHtml(newQ.category)}</p>
  `;

  // clear inputs
  textEl.value = "";
  catEl.value = "";
}

// create the add-quote form dynamically
function createAddQuoteForm() {
  // clear previous if any
  formContainer.innerHTML = "";

  const formDiv = document.createElement("div");
  formDiv.className = "form-section";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addBtn);

  formContainer.appendChild(formDiv);
}

// ===== import / export JSON =====
function exportToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Export failed:", e);
    alert("Failed to export quotes.");
  }
}

function importFromJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) {
        alert("Invalid JSON: expected an array of quotes.");
        return;
      }
      // validate shape (object with text & category strings)
      const valid = parsed.every(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (!valid) {
        alert("Invalid file format. Each item must have 'text' and 'category' fields.");
        return;
      }
      // merge (avoid duplicates? simple push as requirement)
      quotes.push(...parsed);
      saveQuotes();
      alert("Quotes imported successfully!");
      // show one of the imported quotes
      showRandomQuote();
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import JSON file.");
    }
  };
  reader.readAsText(file);
}

// ===== event wiring =====
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJson);

// attach listener to file input
importFileInput.addEventListener("change", function (e) {
  const file = e.target.files && e.target.files[0];
  if (file) importFromJsonFile(file);

  // clear value so same file can be re-selected later if needed
  importFileInput.value = "";
});

// ===== init =====
loadQuotes();       // load from localStorage if present
createAddQuoteForm();
if (quotes && quotes.length > 0) {
  // try to show last shown using sessionStorage
  const lastIdx = getLastShownIndex();
  if (lastIdx !== null && lastIdx >= 0 && lastIdx < quotes.length) {
    // display same quote stored in session
    const q = quotes[lastIdx];
    quoteDisplay.innerHTML = `
      <p>"${escapeHtml(q.text)}"</p>
      <p><em>Category:</em> ${escapeHtml(q.category)}</p>
    `;
  } else {
    showRandomQuote();
  }
} else {
  quoteDisplay.textContent = "No quotes available. Add one below!";
}
