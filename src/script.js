const API_URL = "https://www.googleapis.com/books/v1/volumes?q=";

// DOM elements
const bookGrid = document.getElementById("book-grid");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const cartCount = document.getElementById("cart-count");
const wishlistCount = document.getElementById("wishlist-count");
const cartModal = document.getElementById("cart-modal");
const wishlistModal = document.getElementById("wishlist-modal");
const cartItemsContainer = document.getElementById("cart-items");
const wishlistItemsContainer = document.getElementById("wishlist-items");
const cartToggle = document.getElementById("cart-toggle");
const wishlistToggle = document.getElementById("wishlist-toggle");
const closeCart = document.getElementById("close-cart");
const closeWishlist = document.getElementById("close-wishlist");

let cartBooks = [];
let wishlistBooks = [];
let bookMap = {}; // To store books by their id for easy lookup

// Show loading
function showLoading() {
  bookGrid.innerHTML = `<div class="loading">Loading books...</div>`;
}

// Show error
function showError(message) {
  bookGrid.innerHTML = `<div class="error">${message}</div>`;
}

// Create a book card element
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.dataset.id = book.id;
  bookMap[book.id] = book; // Store book for quick reference

  const thumbnail =
    book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150";
  const title = book.volumeInfo.title || "No Title";
  const authors = book.volumeInfo.authors?.join(", ") || "Unknown Author";
  const description =
    (book.volumeInfo.description
      ? book.volumeInfo.description.slice(0, 100) + "..."
      : "No description available");

  card.innerHTML = `
    <img class="book-cover" src="${thumbnail}" alt="${title}">
    <div class="book-title">${title}</div>
    <div class="book-author">${authors}</div>
    <div class="book-description">${description}</div>
    <div class="book-actions">
      <button class="like-button" data-id="${book.id}" aria-label="Like">❤️</button>
      <button class="cart-button" data-id="${book.id}" aria-label="Add to cart">🛒</button>
      <button class="wishlist-button" data-id="${book.id}" aria-label="Add to wishlist">☆</button>
      <button class="comment-toggle" aria-label="Toggle comment">💬</button>
    </div>
    <form class="comment-form">
      <textarea placeholder="Add a comment..." rows="2"></textarea>
      <button type="submit">Submit</button>
    </form>
    <div class="comments"></div>
  `;
  return card;
}

// Render books to the grid
function renderBooks(books) {
  bookGrid.innerHTML = "";
  books.forEach((book) => {
    const card = createBookCard(book);
    bookGrid.appendChild(card);
  });
  // Update buttons to reflect if books are in cart/wishlist
  document.querySelectorAll(".cart-button").forEach((btn) => {
    if (cartBooks.some((b) => b.id === btn.dataset.id)) btn.classList.add("added");
  });
  document.querySelectorAll(".wishlist-button").forEach((btn) => {
    if (wishlistBooks.some((b) => b.id === btn.dataset.id)) btn.classList.add("wished");
  });
}

// Render modal items
function renderModalItems(container, books, type) {
  container.innerHTML = books.length
    ? ""
    : `<p>No items in your ${type}.</p>`;
  books.forEach((book) => {
    const item = document.createElement("div");
    item.className = "modal-item";
    const thumbnail =
      book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150";
    const title = book.volumeInfo.title || "No Title";
    const authors = book.volumeInfo.authors?.join(", ") || "Unknown Author";
    item.innerHTML = `
      <img src="${thumbnail}" alt="${title}">
      <div class="modal-item-details">
        <h3>${title}</h3>
        <p>${authors}</p>
      </div>
      <button class="remove-button" data-id="${book.id}" data-type="${type}">Remove</button>
    `;
    container.appendChild(item);
  });
}

// Update counters
function updateCounters() {
  cartCount.textContent = cartBooks.length;
  wishlistCount.textContent = wishlistBooks.length;
}

// Fetch books from Google Books API
async function fetchBooks(query = "javascript") {
  showLoading();
  try {
    const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data.items?.length) {
      showError("No books found.");
      return;
    }
    // Store all books in a map for easy lookup
    data.items.forEach((book) => {
      bookMap[book.id] = book;
    });
    renderBooks(data.items);
  } catch (error) {
    showError("An error occurred while fetching books.");
    console.error(error);
  }
}

// Like button
function handleLike(event) {
  if (event.target.classList.contains("like-button")) {
    event.target.classList.toggle("liked");
  }
}

// Cart button
function handleCart(event) {
  if (event.target.classList.contains("cart-button")) {
    const bookId = event.target.dataset.id;
    const isAdded = event.target.classList.toggle("added");
    const book = bookMap[bookId];
    if (isAdded) {
      if (!cartBooks.some((b) => b.id === bookId)) cartBooks.push(book);
    } else {
      cartBooks = cartBooks.filter((b) => b.id !== bookId);
    }
    updateCounters();
    renderModalItems(cartItemsContainer, cartBooks, "cart");
  }
}

// Wishlist button
function handleWishlist(event) {
  if (event.target.classList.contains("wishlist-button")) {
    const bookId = event.target.dataset.id;
    const isWished = event.target.classList.toggle("wished");
    const book = bookMap[bookId];
    if (isWished) {
      if (!wishlistBooks.some((b) => b.id === bookId)) wishlistBooks.push(book);
    } else {
      wishlistBooks = wishlistBooks.filter((b) => b.id !== bookId);
    }
    updateCounters();
    renderModalItems(wishlistItemsContainer, wishlistBooks, "wishlist");
  }
}

// Comment toggle
function handleCommentToggle(event) {
  if (event.target.classList.contains("comment-toggle")) {
    const card = event.target.closest(".book-card");
    if (card) {
      const form = card.querySelector(".comment-form");
      if (form) form.classList.toggle("active");
    }
  }
}

// Handle comment submission
function handleCommentSubmit(event) {
  if (event.target.classList.contains("comment-form")) {
    event.preventDefault();
    const textarea = event.target.querySelector("textarea");
    if (!textarea) return;
    const commentText = textarea.value.trim();
    if (commentText) {
      const commentsDiv = event.target.nextElementSibling;
      if (commentsDiv) {
        const comment = document.createElement("p");
        comment.textContent = commentText;
        commentsDiv.appendChild(comment);
        textarea.value = "";
        event.target.classList.remove("active");
      }
    }
  }
}

// Modal remove and close
function handleModalClick(event) {
  if (event.target.classList.contains("remove-button")) {
    const bookId = event.target.dataset.id;
    const type = event.target.dataset.type;
    if (type === "cart") {
      cartBooks = cartBooks.filter((b) => b.id !== bookId);
      document.querySelector(`.cart-button[data-id="${bookId}"]`)?.classList.remove("added");
      renderModalItems(cartItemsContainer, cartBooks, "cart");
    } else if (type === "wishlist") {
      wishlistBooks = wishlistBooks.filter((b) => b.id !== bookId);
      document.querySelector(`.wishlist-button[data-id="${bookId}"]`)?.classList.remove("wished");
      renderModalItems(wishlistItemsContainer, wishlistBooks, "wishlist");
    }
    updateCounters();
  }
  if (
    event.target.classList.contains("close-modal")
    || event.target === cartModal
    || event.target === wishlistModal
  ) {
    cartModal.classList.remove("active");
    wishlistModal.classList.remove("active");
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchBooks();
  // Search
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim() || "javascript";
    fetchBooks(query);
  });

  // Book grid events
  bookGrid.addEventListener("click", (event) => {
    handleLike(event);
    handleCart(event);
    handleWishlist(event);
    handleCommentToggle(event);
  });
  bookGrid.addEventListener("submit", handleCommentSubmit);

  // Cart modal
  cartToggle.addEventListener("click", () => {
    renderModalItems(cartItemsContainer, cartBooks, "cart");
    cartModal.classList.add("active");
  });

  // Wishlist modal
  wishlistToggle.addEventListener("click", () => {
    renderModalItems(wishlistItemsContainer, wishlistBooks, "wishlist");
    wishlistModal.classList.add("active");
  });

  // Modal remove/close
  document.addEventListener("click", handleModalClick);
});