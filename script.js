// ================== CONFIG & CONSTANTS ==================
const CATEGORIES = [
  {
    id: "Horror",
    name: "Horror",
    img: "https://img.icons8.com/ios-filled/100/haunted-house.png",
  },
  {
    id: "Thriller",
    name: "Thriller",
    img: "https://img.icons8.com/?size=100&id=10528&format=png&color=000000",
  },
  {
    id: "Romance",
    name: "Romantic",
    img: "https://img.icons8.com/ios-filled/100/love-circled.png",
  },
  {
    id: "Philosophy",
    name: "Philosophy",
    img: "https://img.icons8.com/ios-filled/100/greek-pillar.png",
  },
  {
    id: "Political Science",
    name: "Politics",
    img: "https://img.icons8.com/?size=100&id=Fg6mvBMgeSGW&format=png&color=000000",
  },
  {
    id: "Self-Help",
    name: "Self-help",
    img: "https://img.icons8.com/ios-filled/100/goal.png",
  },
];
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const DEFAULT_IMG = "https://via.placeholder.com/100x150?text=No+Cover";

// ================== UTILITIES ==================
function formatKesh(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "Ksh0.00";
  return `Ksh${amount.toLocaleString("en-KE")}.00`;
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}
function getOrders() {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}
function saveProfile(profile) {
  localStorage.setItem("profile", JSON.stringify(profile));
}
function getProfile() {
  return JSON.parse(localStorage.getItem("profile") || "{}");
}
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((a, b) => a + (b.qty || 1), 0);
  document
    .querySelectorAll("#cart-count")
    .forEach((el) => (el.textContent = count));
}

// ================== GOOGLE BOOKS FETCH ==================
async function fetchBooks({ q = null, category = null, maxResults = 10 } = {}) {
  let query = "";
  if (q) {
    query = q;
  } else if (category) {
    query = `subject:"${category}"`;
  } else {
    // Default: random books (use a random letter as query for variety)
    const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    query = randomLetter;
  }
  const params = new URLSearchParams({
    q: query,
    maxResults,
    printType: "books",
    orderBy: "relevance",
  });
  const resp = await fetch(`${GOOGLE_BOOKS_API}?${params}`);
  const data = await resp.json();
  if (!data.items) return [];
  return data.items.map((item) => {
    const info = item.volumeInfo;
    let price = Math.floor(Math.random() * 1000) + 500;
    if (
      item.saleInfo &&
      item.saleInfo.listPrice &&
      typeof item.saleInfo.listPrice.amount === "number"
    ) {
      price = Math.round(item.saleInfo.listPrice.amount * 140);
    }
    return {
      id: item.id,
      title: info.title || "Untitled",
      author: (info.authors && info.authors.join(", ")) || "Unknown",
      price,
      img:
        info.imageLinks && info.imageLinks.thumbnail
          ? info.imageLinks.thumbnail
          : DEFAULT_IMG,
    };
  });
}

// ================== BANNER SLIDER ==================
function initBannerSlider() {
  const slider = document.querySelector(".banner-slider");
  if (!slider) return;
  const slides = slider.querySelectorAll(".banner-slide");
  let index = 0;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === 0));
  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 3400);
}

// ================== HOME PAGE ==================
function renderCategories() {
  const container = document.getElementById("home-categories");
  if (!container) return;
  container.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "category-card col";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", cat.name);
    card.innerHTML = `
      <img src="${cat.img}" alt="${cat.name} Icon" />
      <div class="fw-bold">${cat.name}</div>
    `;
    card.onclick = () => {
      window.location.href = `books.html?category=${encodeURIComponent(cat.id)}`;
    };
    container.appendChild(card);
  });
}

// ================== BOOKS PAGE ==================
async function renderBooksPage() {
  const booksList = document.getElementById("books-list");
  const title = document.getElementById("books-category-title");
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get("q");
  const category = urlParams.get("category");

  // Set title
  if (q) {
    title.textContent = `Search results for "${q}"`;
  } else if (category) {
    const cat = CATEGORIES.find((c) => c.id === category);
    title.textContent = cat ? `${cat.name} Books` : "Books";
  } else {
    title.textContent = "Random Books";
  }

  booksList.innerHTML = `<div class="text-center mt-4 mb-4 w-100"><div class="spinner-border text-primary" role="status"></div></div>`;

  let books = [];
  try {
    books = await fetchBooks({ q, category });
  } catch (e) {
    //
  }
  if (!books.length) {
    booksList.innerHTML = `<div class="text-center text-muted my-5 w-100">No books found.</div>`;
    return;
  }

  booksList.innerHTML = "";
  books.forEach((book) => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="book-card h-100 d-flex flex-column">
        <img src="${book.img}" alt="${book.title}" />
        <div class="book-title">${book.title}</div>
        <div class="book-author">by ${book.author}</div>
        <div class="book-price">${formatKesh(book.price)}</div>
        <button class="btn btn-outline-primary mt-auto" data-id="${book.id}">Add to Cart</button>
      </div>
    `;
    col.querySelector("button").onclick = () => addToCart(book);
    booksList.appendChild(col);
  });
}

// ========== CATEGORY DROPDOWN (for SPA-like UX, optional) ==========
function setupDropdownLinks() {
  document.querySelectorAll("#books-dropdown a.dropdown-item").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      window.location.href = href;
    });
  });
}

// ================== SEARCH HANDLING ==================
// (Already handled by renderBooksPage - if ?q= is present, it will show search results)

// ================== CART ==================
function addToCart(book) {
  let cart = getCart();
  const found = cart.find((item) => item.id === book.id);
  if (found) {
    found.qty++;
  } else {
    cart.push({ ...book, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  alert("Added to cart!");
}

function removeFromCart(bookId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== bookId);
  saveCart(cart);
  renderCartList();
  updateCartCount();
}

function renderCartList() {
  const cart = getCart();
  const cartList = document.getElementById("cart-list");
  if (!cartList) return;
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-center";
    li.innerHTML = `
      <img src="${item.img}" alt="${item.title}" class="cart-item-img" />
      <div class="flex-grow-1">
        <div class="fw-bold">${item.title}</div>
        <small>by ${item.author}</small>
        <div>${formatKesh(item.price)} x ${item.qty}</div>
      </div>
      <button class="btn btn-sm btn-danger ms-2" title="Remove">&times;</button>
    `;
    li.querySelector("button").onclick = () => removeFromCart(item.id);
    cartList.appendChild(li);
  });
  const cartTotal = document.getElementById("cart-total");
  if (cartTotal) cartTotal.textContent = formatKesh(total);
}

// ================== CART ORDER MODAL ==================
function setupOrderModal() {
  const placeOrderBtn = document.getElementById("btn-place-order");
  if (!placeOrderBtn) return;
  const orderDetailsModalElem = document.getElementById("orderDetailsModal");
  let orderDetailsModal = null;
  if (orderDetailsModalElem && window.bootstrap) {
    orderDetailsModal = bootstrap.Modal.getOrCreateInstance(orderDetailsModalElem);
  }
  placeOrderBtn.onclick = () => {
    if (!getCart().length) {
      alert("Your cart is empty!");
      return;
    }
    showOrderForm(orderDetailsModal);
  };
  const form = document.getElementById("order-details-form");
  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add("was-validated");
        return false;
      }
      const profile = {
        name: document.getElementById("order-name").value.trim(),
        phone: document.getElementById("order-phone").value.trim(),
        address: document.getElementById("order-address").value.trim(),
        state: document.getElementById("order-state").value.trim(),
        country: document.getElementById("order-country").value.trim(),
        pincode: document.getElementById("order-pincode").value.trim(),
        email: document.getElementById("order-email").value.trim(),
      };
      saveProfile(profile);
      const cart = getCart();
      const order = {
        id: Date.now(),
        items: cart.map((item) => ({ ...item })),
        total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        profile: { ...profile },
        date: new Date().toLocaleString(),
      };
      let orders = getOrders();
      orders.push(order);
      saveOrders(orders);
      saveCart([]);
      updateCartCount();
      if (orderDetailsModal) orderDetailsModal.hide();
      window.location.href = "orders.html";
      alert("Order placed successfully!");
      return false;
    };
  }
}

function showOrderForm(orderDetailsModal) {
  const profile = getProfile();
  document.getElementById("order-name").value = profile.name || "";
  document.getElementById("order-phone").value = profile.phone || "";
  document.getElementById("order-address").value = profile.address || "";
  document.getElementById("order-state").value = profile.state || "";
  document.getElementById("order-country").value = profile.country || "";
  document.getElementById("order-pincode").value = profile.pincode || "";
  document.getElementById("order-email").value = profile.email || "";
  if (orderDetailsModal) orderDetailsModal.show();
}

// ================== ORDERS ==================
function renderOrders() {
  const ordersList = document.getElementById("orders-list");
  if (!ordersList) return;
  const orders = getOrders();
  ordersList.innerHTML = "";
  if (!orders.length) {
    ordersList.innerHTML = `<li class="list-group-item text-center">No orders yet.</li>`;
    return;
  }
  orders
    .slice()
    .reverse()
    .forEach((order) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
      <div class="fw-bold mb-1">Order #${order.id}</div>
      <div><b>Date:</b> ${order.date}</div>
      <div><b>Name:</b> ${order.profile.name}</div>
      <div><b>Delivery:</b> ${order.profile.address}, ${order.profile.state}, ${order.profile.country} (${order.profile.pincode})</div>
      <div>
        <ul style="list-style: inside; padding-left: 1em; margin: 0.5em 0;">
          ${order.items.map((item) => `<li>${item.title} x ${item.qty}</li>`).join("")}
        </ul>
      </div>
      <div class="text-success"><b>Total: ${formatKesh(order.total)}</b></div>
    `;
      ordersList.appendChild(li);
    });
}

// ================== ACCOUNT ==================
function setupAccountForm() {
  const form = document.getElementById("account-form");
  if (!form) return;
  const profile = getProfile();
  document.getElementById("input-name").value = profile.name || "";
  document.getElementById("input-email").value = profile.email || "";
  form.onsubmit = function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return false;
    }
    profile.name = document.getElementById("input-name").value.trim();
    profile.email = document.getElementById("input-email").value.trim();
    saveProfile(profile);
    alert("Profile updated!");
    return false;
  };
}

// ================== INIT ROUTER ==================
document.addEventListener("DOMContentLoaded", function () {
  // Footer year
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  updateCartCount();

  // Home page
  if (document.getElementById("home-categories")) {
    renderCategories();
    initBannerSlider();
  }

  // Books page
  if (document.getElementById("books-list")) {
    renderBooksPage();
    setupDropdownLinks();
  }

  // Cart page
  if (document.getElementById("cart-list")) {
    renderCartList();
    setupOrderModal();
  }

  // Orders page
  if (document.getElementById("orders-list")) {
    renderOrders();
  }

  // Account page
  if (document.getElementById("account-form")) {
    setupAccountForm();
  }
});