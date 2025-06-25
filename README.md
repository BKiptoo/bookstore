# Online Bookstore Application

## Overview
This JavaScript application powers an online bookstore with features to browse books by category, manage a shopping cart, place orders, and maintain user profiles. It interacts with the Google Books API to fetch book data and uses local storage for cart, order, and profile persistence.

## Features
- **Category Browsing**: Displays book categories (Horror, Thriller, Romance, Philosophy, Political Science, Self-Help) with icons, linking to category-specific book lists.
- **Book Listing**: Fetches and displays books from the Google Books API based on search queries, categories, or random selection.
- **Search Functionality**: Supports keyword-based book search via URL query parameters.
- **Cart Management**: Allows users to add or remove books to/from a cart, with quantity tracking and total price calculation.
- **Order Processing**: Enables users to place orders with delivery details, storing order history locally.
- **Profile Management**: Stores user details (name, email, etc.) for account and order purposes.
- **Banner Slider**: Displays promotional banners on the homepage with automatic rotation.

## Setup
1. **Dependencies**:
   - Bootstrap (for modals and styling).
   - Google Books API (no API key required for public access).
   - Include the JavaScript file in your HTML pages.
   - Ensure HTML elements have corresponding IDs (`home-categories`, `books-list`, `cart-list`, etc.) as referenced in the code.
2. **Local Storage**:
   - The application uses `localStorage` to persist cart, orders, and profile data.
3. **HTML Pages**:
   - Home (`index.html`): Displays categories and banners.
   - Books (`books.html`): Lists books with search and category filters.
   - Cart (`cart.html`): Shows cart items and order placement form.
   - Orders (`orders.html`): Displays order history.
   - Account (`account.html`): Manages user profile.

## Usage
- **Navigation**:
  - Click category cards on the homepage to view books in that genre.
  - Use the search bar to find books by keyword.
  - Access cart, orders, and account pages via navigation links.
- **Cart**:
  - Add books to the cart from the books page.
  - View and remove items in the cart page.
- **Orders**:
  - Place orders from the cart page by filling out the delivery form.
  - View past orders on the orders page.
- **Account**:
  - Update name and email in the account page.

## Code Structure
- **Constants**:
  - `CATEGORIES`: Array of book categories with IDs, names, and icons.
  - `GOOGLE_BOOKS_API`: API endpoint for book data.
  - `DEFAULT_IMG`: Fallback image for books without covers.
- **Utilities**:
  - `formatKesh`: Formats prices in Kenyan Shillings.
  - `saveCart`, `getCart`, `saveOrders`, `getOrders`, `saveProfile`, `getProfile`: Manage local storage.
  - `updateCartCount`: Updates cart item count in the UI.
- **Google Books Fetch**:
  - `fetchBooks`: Fetches books based on query, category, or random selection.
- **Banner Slider**:
  - `initBannerSlider`: Initializes automatic banner rotation.
- **Page Rendering**:
  - `renderCategories`: Displays category cards on the homepage.
  - `renderBooksPage`: Renders book lists with search/category filters.
  - `renderCartList`: Shows cart items and total.
  - `renderOrders`: Displays order history.
  - `setupAccountForm`: Manages profile updates.
- **Cart & Orders**:
  - `addToCart`, `removeFromCart`: Manage cart items.
  - `setupOrderModal`, `showOrderForm`: Handle order placement.
- **Initialization**:
  - Event listener for `DOMContentLoaded` initializes page-specific functionality.

## Notes
- The application assumes Bootstrap for modals and styling. Ensure Bootstrap CSS and JS are included.
- Prices are either derived from the Google Books API (converted to KES) or randomly generated (500-1500 KES).
- No server-side backend is required; all data is stored in `localStorage`.

## Limitations
- Relies on client-side storage, so data is not persistent across devices or browsers.
- Google Books API may have rate limits or inconsistent data.
- No authentication or user session management.

## Future Improvements
- Add backend integration for persistent storage and user accounts.
- Implement pagination for book lists.
- Enhance search with advanced filters (e.g., price range, author).
- Add unit tests for utility functions.