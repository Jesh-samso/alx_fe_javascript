let quotes = []
let syncing = false
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"

document.addEventListener("DOMContentLoaded", () => {
  const savedQuotes = localStorage.getItem("quotes")
  quotes = savedQuotes ? JSON.parse(savedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" }
  ]

  createAddQuoteForm()
  populateCategories()

  const lastFilter = localStorage.getItem("selectedCategory") || "all"
  document.getElementById("categoryFilter").value = lastFilter
  filterQuotes()

  document.getElementById("newQuote").addEventListener("click", showRandomQuote)
  document.getElementById("exportBtn").addEventListener("click", exportQuotes)
  document.getElementById("importFile").addEventListener("change", importFromJsonFile)

  startServerSync()
})

// show random quote
function showRandomQuote() {
  const filtered = getFilteredQuotes()
  const display = document.getElementById("quoteDisplay")
  display.innerHTML = ""

  if (filtered.length === 0) {
    display.textContent = "No quotes in this category yet."
    return
  }

  const random = Math.floor(Math.random() * filtered.length)
  const quote = filtered[random]

  const textEl = document.createElement("p")
  textEl.textContent = `"${quote.text}"`
  const catEl = document.createElement("p")
  catEl.innerHTML = `<em>— ${quote.category}</em>`

  display.appendChild(textEl)
  display.appendChild(catEl)

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote))
}

// create form
function createAddQuoteForm() {
  const container = document.getElementById("formContainer")
  container.innerHTML = ""

  const textInput = document.createElement("input")
  textInput.id = "newQuoteText"
  textInput.type = "text"
  textInput.placeholder = "Enter a new quote"

  const catInput = document.createElement("input")
  catInput.id = "newQuoteCategory"
  catInput.type = "text"
  catInput.placeholder = "Enter quote category"

  const addBtn = document.createElement("button")
  addBtn.textContent = "Add Quote"
  addBtn.onclick = addQuote

  container.appendChild(textInput)
  container.appendChild(catInput)
  container.appendChild(addBtn)
}

// add quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim()
  const cat = document.getElementById("newQuoteCategory").value.trim()

  if (text && cat) {
    quotes.push({ text, category: cat })
    saveQuotes()
    populateCategories()
    filterQuotes()
    syncQuotes()
    document.getElementById("newQuoteText").value = ""
    document.getElementById("newQuoteCategory").value = ""
    alert("Quote added successfully!")
  } else {
    alert("Please fill in both fields!")
  }
}

// save locally
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes))
}

// populate categories
function populateCategories() {
  const select = document.getElementById("categoryFilter")
  const current = select.value
  select.innerHTML = ""

  const allOpt = document.createElement("option")
  allOpt.value = "all"
  allOpt.textContent = "All Categories"
  select.appendChild(allOpt)

  const uniqueCats = [...new Set(quotes.map(q => q.category))]
  uniqueCats.forEach(cat => {
    const opt = document.createElement("option")
    opt.value = cat
    opt.textContent = cat
    select.appendChild(opt)
  })

  select.value = current || "all"
}

// filter by category
function filterQuotes() {
  const cat = document.getElementById("categoryFilter").value
  localStorage.setItem("selectedCategory", cat)
  showRandomQuote()
}

function getFilteredQuotes() {
  const cat = document.getElementById("categoryFilter").value
  if (cat === "all") return quotes
  return quotes.filter(q => q.category === cat)
}

// export quotes to json
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "quotes.json"
  a.click()
  URL.revokeObjectURL(url)
}

// import quotes from json
function importFromJsonFile(event) {
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result)
      if (Array.isArray(imported)) {
        quotes.push(...imported)
        saveQuotes()
        populateCategories()
        filterQuotes()
        alert("Quotes imported successfully!")
      } else {
        alert("Invalid JSON file!")
      }
    } catch {
      alert("Error reading file!")
    }
  }
  reader.readAsText(event.target.files[0])
}

// 🟢 async fetch from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL)
    const data = await res.json()
    return data.slice(0, 5).map((p, i) => ({
      text: p.title,
      category: i % 2 === 0 ? "Server" : "Fetched"
    }))
  } catch (err) {
    console.error("Error fetching from server:", err)
    return []
  }
}

// 🔁 async sync logic with POST method
async function syncWithServer() {
  if (syncing) return
  syncing = true

  try {
    const serverQuotes = await fetchQuotesFromServer()

    await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    })

    const merged = [...quotes, ...serverQuotes].filter(
      (q, i, self) => i === self.findIndex(o => o.text === q.text)
    )

    quotes = merged
    saveQuotes()
    populateCategories()
    showNotification("Quotes synced with server!")
  } catch (error) {
    console.log("Sync failed:", error)
    showNotification("Server sync failed, working offline.")
  } finally {
    syncing = false
  }
}

// ✅ wrapper function for checker (calls syncWithServer)
async function syncQuotes() {
  await syncWithServer()
}

// auto sync every 30s
function startServerSync() {
  setInterval(syncWithServer, 30000)
}

// notification banner
function showNotification(msg) {
  let note = document.getElementById("notify")
  if (!note) {
    note = document.createElement("div")
    note.id = "notify"
    note.style.position = "fixed"
    note.style.bottom = "10px"
    note.style.right = "10px"
    note.style.background = "#222"
    note.style.color = "#fff"
    note.style.padding = "8px 15px"
    note.style.borderRadius = "5px"
    document.body.appendChild(note)
  }
  note.textContent = msg
  note.style.display = "block"
  setTimeout(() => { note.style.display = "none" }, 3000)
}
