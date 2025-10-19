// ===== Quotes Array =====
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" }
];

// ===== Select Elements =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// ===== Function: Display a Random Quote =====
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>"${randomQuote.text}"</strong></p>
    <p><em>Category:</em> ${randomQuote.category}</p>
  `;
}

// ===== Function: Add a New Quote and Update DOM =====
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please enter both quote and category!");
    return;
  }

  // Add to quotes array
  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);

  // Update DOM with confirmation
  quoteDisplay.innerHTML = `
    <p><strong>New quote added!</strong></p>
    <p>"${quoteText}"</p>
    <p><em>Category:</em> ${quoteCategory}</p>
  `;

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ===== Event Listener for Show New Quote Button =====
newQuoteButton.addEventListener("click", showRandomQuote);

// Show an initial quote on page load
showRandomQuote();
