let quotes = [];

// Load data when page loads
document.addEventListener("DOMContentLoaded", () => {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" }
  ];

  createAddQuoteForm();
  populateCategories();

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  document.getElementById("categoryFilter").value = savedFilter;

  filterQuotes();

  // Event listeners
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
});

// Display a random quote
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes in this category yet.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${quote.text}"</p>
    <p><em>— ${quote.category}</em></p>
  `;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Create Add Quote Form
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    filterQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields!");
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category filter dynamically
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const selectedValue = select.value;
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  select.innerHTML = categories.map(cat => 
    `<option value="${cat}">${cat}</option>`
  ).join("");

  select.value = selectedValue;
}

// Filter quotes by category
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);
  showRandomQuote();
}

// Return filtered quotes
function getFilteredQuotes() {
  const category = document.getElementById("categoryFilter").value;
  if (category === "all") return quotes;
  return quotes.filter(q => q.category === category);
}

// Export quotes as JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch {
      alert("Error reading JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
