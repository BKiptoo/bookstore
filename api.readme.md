# Google Books API Documentation for Online Bookstore Application

## Document Information
**Title**: Google Books API Documentation  
**Date**: June 25, 2025  
**Version**: 1.0  
**Author**: Bettson Kiptoo

---

## Table of Contents
1. Introduction
2. API Overview
3. API Endpoint Used
4. Request Parameters
5. Response Structure
6. Integration in the Application
7. Authentication and Rate Limits
8. Error Handling
9. Limitations
10. References

---

## 1. Introduction
This document details the Google Books API used in the online bookstore application. The API is employed to fetch book data for browsing, searching, and displaying books in the application. The document covers the API’s endpoint, parameters, response structure, and its integration into the JavaScript codebase.

---

## 2. API Overview
The Google Books API is a public RESTful API provided by Google to access book metadata, including titles, authors, cover images, and pricing information (when available). It allows developers to query books by keywords, categories, or other criteria and retrieve structured data in JSON format.

- **Base URL**: `https://www.googleapis.com/books/v1`
- **Primary Use in Application**: Fetching book data for display on the books page, filtered by category, search query, or random selection.
- **Key Endpoint**: `/volumes` (used to retrieve book volumes).

---

## 3. API Endpoint Used
The application uses the following endpoint to fetch book data:

**Endpoint**: `GET /volumes`

**Description**: Retrieves a list of book volumes matching the query parameters.

**Example Request** (as implemented in the code):
```
https://www.googleapis.com/books/v1/volumes?q=subject:Horror&maxResults=10&printType=books&orderBy=relevance
```

**Purpose**: Fetches up to 10 books in the "Horror" category, filtered to include only books (not magazines) and sorted by relevance.

---

## 4. Request Parameters
The application constructs API requests using the following query parameters:

| Parameter   | Description                                                                 | Values Used in Code                   | Required |
|-------------|-----------------------------------------------------------------------------|---------------------------------------|----------|
| `q`         | Query string for searching books (e.g., keywords, subject, author).         | `subject:{category}`, search term, or random letter | Yes      |
| `maxResults`| Maximum number of results to return per request (1–40).                     | `10`                                  | No       |
| `printType` | Filters results by publication type.                                        | `books`                               | No       |
| `orderBy`   | Sorts results by relevance or publication date.                            | `relevance`                           | No       |

### Parameter Usage in Code
- **Query (`q`)**:
  - For category-based searches: `subject:"{category}"` (e.g., `subject:Horror`).
  - For keyword searches: Direct user input from URL parameter `?q=`.
  - For random books: A random letter (a–z) to fetch diverse results.
- **maxResults**: Fixed at 10 to limit the number of books displayed.
- **printType**: Set to `books` to exclude non-book items like magazines.
- **orderBy**: Set to `relevance` to prioritize relevant results.

**Code Snippet** (from `fetchBooks` function):
```javascript
const params = new URLSearchParams({
  q: query,
  maxResults,
  printType: "books",
  orderBy: "relevance",
});
const resp = await fetch(`${GOOGLE_BOOKS_API}?${params}`);
```

---

## 5. Response Structure
The API returns a JSON object containing book data. Below is the relevant structure used in the application:

```json
{
  "items": [
    {
      "id": "string",
      "volumeInfo": {
        "title": "string",
        "authors": ["string"],
        "imageLinks": {
          "thumbnail": "string"
        }
      },
      "saleInfo": {
        "listPrice": {
          "amount": number,
          "currencyCode": "string"
        }
      }
    }
  ]
}
```

### Fields Used in Application
| Field Path                      | Description                              | Application Use                     |
|----------------------------------|------------------------------------------|-------------------------------------|
| `items[].id`                    | Unique book ID.                          | Book identifier for cart/orders.    |
| `items[].volumeInfo.title`      | Book title.                              | Displayed on book cards.            |
| `items[].volumeInfo.authors`    | Array of author names.                   | Joined and displayed as author.     |
| `items[].volumeInfo.imageLinks.thumbnail` | Book cover image URL.                    | Displayed as book cover (or fallback image). |
| `items[].saleInfo.listPrice.amount` | Book price (if available).               | Converted to KES or random price used. |

### Data Processing
- **Title**: Defaults to "Untitled" if missing.
- **Authors**: Joined with commas; defaults to "Unknown" if missing.
- **Image**: Uses thumbnail URL or a placeholder (`DEFAULT_IMG`) if unavailable.
- **Price**:
  - If `listPrice.amount` exists, multiplied by 140 (to convert to KES).
  - Otherwise, a random price between 500 and 1500 KES is generated.

**Code Snippet** (from `fetchBooks`):
```javascript
return data.items.map((item) => {
  const info = item.volumeInfo;
  let price = Math.floor(Math.random() * 1000) + 500;
  if (item.saleInfo && item.saleInfo.listPrice && typeof item.saleInfo.listPrice.amount === "number") {
    price = Math.round(item.saleInfo.listPrice.amount * 140);
  }
  return {
    id: item.id,
    title: info.title || "Untitled",
    author: (info.authors && info.authors.join(", ")) || "Unknown",
    price,
    img: info.imageLinks && info.imageLinks.thumbnail ? info.imageLinks.thumbnail : DEFAULT_IMG,
  };
});
```

---

## 6. Integration in the Application
The Google Books API is integrated via the `fetchBooks` function, called on the books page (`books.html`) to populate the book list. The function is invoked in `renderBooksPage`:

```javascript
async function renderBooksPage() {
  const booksList = document.getElementById("books-list");
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get("q");
  const category = urlParams.get("category");
  booksList.innerHTML = `<div class="text-center mt-4 mb-4 w-100"><div class="spinner-border text-primary" role="status"></div></div>`;
  let books = [];
  try {
    books = await fetchBooks({ q, category });
  } catch (e) {
    //
  }
  // Render books or show "No books found"
}
```

### Workflow
1. **URL Parsing**: Checks for `q` (search query) or `category` in the URL.
2. **API Call**: Calls `fetchBooks` with the appropriate query.
3. **Rendering**:
   - Displays a loading spinner during the API call.
   - Renders book cards with title, author, price, and cover image.
   - Shows "No books found" if the response is empty.

### Use Cases
- **Category Filter**: `?category=Horror` fetches books with `subject:Horror`.
- **Search**: `?q=javascript` fetches books matching the keyword.
- **Random Books**: No parameters result in a random letter query (e.g., `q=a`).

---

## 7. Authentication and Rate Limits
- **Authentication**: The application uses the public Google Books API, which does not require an API key for basic queries. However, for production use, Google recommends including an API key to track usage.
- **Rate Limits**: Google imposes a quota of 1,000 requests per day per project for unauthenticated access. For higher limits, an API key and billing setup are required.
- **Code Implication**: The application does not include an API key, relying on public access. This may lead to rate-limiting issues in heavy usage scenarios.

---

## 8. Error Handling
The code includes minimal error handling for API requests:

```javascript
try {
  books = await fetchBooks({ q, category });
} catch (e) {
  //
}
```

- **Current Behavior**: If the API call fails (e.g., network error, rate limit), the application silently fails and displays "No books found."
- **Limitations**: No user feedback for errors (e.g., network issues or invalid responses).
- **Recommendation**: Enhance error handling to display user-friendly messages (e.g., "Failed to load books. Please try again.").

---

## 9. Limitations
- **Incomplete Data**: Some books may lack cover images, authors, or prices, requiring fallbacks (e.g., random prices, placeholder images).
- **Rate Limits**: Unauthenticated access may hit quota limits.
- **Currency Conversion**: Prices are converted to KES using a fixed multiplier (140), which may not reflect real-time exchange rates.
- **No Pagination**: The application fetches only 10 results per query, with no support for additional pages.
- **Subject Queries**: Category searches use `subject:{category}`, which may not map perfectly to Google’s internal taxonomy (e.g., "Political Science" may yield inconsistent results).

---

## 10. References
- **Google Books API Documentation**: [https://developers.google.com/books/docs/v1/using](https://developers.google.com/books/docs/v1/using)
- **Volumes Endpoint**: [https://developers.google.com/books/docs/v1/reference/volumes](https://developers.google.com/books/docs/v1/reference/volumes)
- **Query Syntax**: [https://developers.google.com/books/docs/v1/using#query-params](https://developers.google.com/books/docs/v1/using#query-params)
- **Rate Limits**: [https://developers.google.com/books/docs/v1/getting_started#quota](https://developers.google.com/books/docs/v1/getting_started#quota)

---
