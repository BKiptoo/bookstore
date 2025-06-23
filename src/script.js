

        const API_URL = 'https://www.googleapis.com/books/v1/volumes?q=';

        // DOM elements
        const bookGrid = document.getElementById('book-grid');
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const cartCount = document.getElementById('cart-count');
        const wishlistCount = document.getElementById('wishlist-count');
        const cartModal = document.getElementById('cart-modal');
        const wishlistModal = document.getElementById('wishlist-modal');
        const cartItemsContainer = document.getElementById('cart-items');
        const wishlistItemsContainer = document.getElementById('wishlist-items');
        const cartToggle = document.getElementById('cart-toggle');
        const wishlistToggle = document.getElementById('wishlist-toggle');
        const closeCart = document.getElementById('close-cart');
        const closeWishlist = document.getElementById('close-wishlist');
        let cartBooks = [];
        let wishlistBooks = [];

        // Utility function to show loading state
        const showLoading = () => {
            if (bookGrid) {
                bookGrid.innerHTML = '<div class="loading">Loading books...</div>';
            } else {
                console.error('bookGrid element not found');
            }
        };

        // Utility function to show error state
        const showError = (message) => {
            if (bookGrid) {
                bookGrid.innerHTML = `<div class="error">${message}</div>`;
            } else {
                console.error('bookGrid element not found');
            }
        };

        // Utility function to create a book card
        const createBookCard = (book) => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const thumbnail = book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150';
            const title = book.volumeInfo.title || 'No Title';
            const authors = book.volumeInfo.authors?.join(', ') || 'Unknown Author';
            const description = book.volumeInfo.description?.slice(0, 100) + '...' || 'No description available';

            card.innerHTML = `
                <img src="${thumbnail}" alt="${title}">
                <div class="book-card-content">
                    <h3>${title}</h3>
                    <p>${authors}</p>
                    <p>${description}</p>
                    <div class="book-card-actions">
                        <button class="like-button" data-id="${book.id}">❤️</button>
                        <button class="cart-button" data-id="${book.id}">🛒</button>
                        <button class="wishlist-button" data-id="${book.id}">☆</button>
                        <button class="comment-toggle">Comment</button>
                    </div>
                    <form class="comment-form">
                        <textarea placeholder="Add a comment..." rows="3"></textarea>
                        <button type="submit">Submit</button>
                    </form>
                    <div class="comments"></div>
                </div>
            `;
            return card;
        };

        // Utility function to render modal items
        const renderModalItems = (container, books, type) => {
            if (container) {
                container.innerHTML = books.length ? '' : `<p>No items in your ${type}.</p>`;
                books.forEach(book => {
                    const item = document.createElement('div');
                    item.className = 'modal-item';
                    const thumbnail = book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150';
                    const title = book.volumeInfo.title || 'No Title';
                    const authors = book.volumeInfo.authors?.join(', ') || 'Unknown Author';
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
            } else {
                console.error(`${type} items container not found`);
            }
        };

        // Update counters
        const updateCounters = () => {
            if (cartCount) cartCount.textContent = cartBooks.length;
            if (wishlistCount) wishlistCount.textContent = wishlistBooks.length;
        };

        // Fetch books from Google Books API
        const fetchBooks = async (query = 'javascript') => {
            showLoading();
            try {
                const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('API response:', data);
                if (!data.items?.length) {
                    showError('No books found.');
                    return;
                }
                if (bookGrid) {
                    bookGrid.innerHTML = '';
                    data.items.forEach((book) => {
                        bookGrid.appendChild(createBookCard(book));
                    });
                    // Update button states based on cart and wishlist
                    document.querySelectorAll('.cart-button').forEach(btn => {
                        if (cartBooks.some(book => book.id === btn.dataset.id)) {
                            btn.classList.add('added');
                        }
                    });
                    document.querySelectorAll('.wishlist-button').forEach(btn => {
                        if (wishlistBooks.some(book => book.id === btn.dataset.id)) {
                            btn.classList.add('wished');
                        }
                    });
                } else {
                    console.error('bookGrid element not found');
                }
            } catch (error) {
                showError('An error occurred while fetching books.');
                console.error('Fetch error:', error);
            }
        };

        // Handle like button click
        const handleLike = (event) => {
            if (event.target.classList.contains('like-button')) {
                event.target.classList.toggle('liked');
                console.log('Like toggled for book:', event.target.dataset.id);
            }
        };

        // Handle cart button click
        const handleCart = (event) => {
            if (event.target.classList.contains('cart-button')) {
                const bookId = event.target.dataset.id;
                const isAdded = event.target.classList.toggle('added');
                const book = Array.from(document.querySelectorAll('.book-card'))
                    .find(card => card.querySelector(`.cart-button[data-id="${bookId}"]`))
                    ?.bookData || { id: bookId, volumeInfo: {} }; // Fallback if book data not stored
                if (isAdded) {
                    if (!cartBooks.some(b => b.id === bookId)) {
                        cartBooks.push(book);
                        console.log('Added to cart:', bookId);
                    }
                } else {
                    cartBooks = cartBooks.filter(b => b.id !== bookId);
                    console.log('Removed from cart:', bookId);
                }
                updateCounters();
                renderModalItems(cartItemsContainer, cartBooks, 'cart');
            }
        };

        // Handle wishlist button click
        const handleWishlist = (event) => {
            if (event.target.classList.contains('wishlist-button')) {
                const bookId = event.target.dataset.id;
                const isWished = event.target.classList.toggle('wished');
                const book = Array.from(document.querySelectorAll('.book-card'))
                    .find(card => card.querySelector(`.wishlist-button[data-id="${bookId}"]`))
                    ?.bookData || { id: bookId, volumeInfo: {} }; // Fallback
                if (isWished) {
                    if (!wishlistBooks.some(b => b.id === bookId)) {
                        wishlistBooks.push(book);
                        console.log('Added to wishlist:', bookId);
                    }
                } else {
                    wishlistBooks = wishlistBooks.filter(b => b.id !== bookId);
                    console.log('Removed from wishlist:', bookId);
                }
                updateCounters();
                renderModalItems(wishlistItemsContainer, wishlistBooks, 'wishlist');
            }
        };

        // Handle comment toggle
        const handleCommentToggle = (event) => {
            if (event.target.classList.contains('comment-toggle')) {
                const card = event.target.closest('.book-card');
                if (card) {
                    const form = card.querySelector('.comment-form');
                    if (form) {
                        form.classList.toggle('active');
                        console.log('Comment form toggled for book:', card.querySelector('.like-button')?.dataset.id);
                    } else {
                        console.error('Comment form not found in book card');
                    }
                } else {
                    console.error('Book card not found');
                }
            }
        };

        // Handle comment submission
        const handleCommentSubmit = (event) => {
            event.preventDefault();
            if (event.target.classList.contains('comment-form')) {
                const textarea = event.target.querySelector('textarea');
                if (textarea) {
                    const commentText = textarea.value.trim();
                    if (commentText) {
                        const commentsDiv = event.target.nextElementSibling;
                        if (commentsDiv) {
                            const comment = document.createElement('p');
                            comment.textContent = commentText;
                            commentsDiv.appendChild(comment);
                            textarea.value = '';
                            event.target.classList.remove('active');
                            console.log('Comment added:', commentText);
                        } else {
                            console.error('Comments div not found');
                        }
                    } else {
                        console.warn('Comment text is empty');
                    }
                } else {
                    console.error('Textarea not found in comment form');
                }
            }
        };

        // Handle modal interactions
        const handleModal = (event) => {
            if (event.target.classList.contains('remove-button')) {
                const bookId = event.target.dataset.id;
                const type = event.target.dataset.type;
                if (type === 'cart') {
                    cartBooks = cartBooks.filter(b => b.id !== bookId);
                    document.querySelector(`.cart-button[data-id="${bookId}"]`)?.classList.remove('added');
                    renderModalItems(cartItemsContainer, cartBooks, 'cart');
                    console.log('Removed from cart via modal:', bookId);
                } else if (type === 'wishlist') {
                    wishlistBooks = wishlistBooks.filter(b => b.id !== bookId);
                    document.querySelector(`.wishlist-button[data-id="${bookId}"]`)?.classList.remove('wished');
                    renderModalItems(wishlistItemsContainer, wishlistBooks, 'wishlist');
                    console.log('Removed from wishlist via modal:', bookId);
                }
                updateCounters();
            } else if (event.target.classList.contains('close-modal') || event.target.classList.contains('modal')) {
                if (cartModal) cartModal.classList.remove('active');
                if (wishlistModal) wishlistModal.classList.remove('active');
                console.log('Modal closed');
            }
        };

        // Event Listeners
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM fully loaded');
            if (!bookGrid || !searchInput || !searchButton || !cartCount || !wishlistCount || !cartModal || !wishlistModal) {
                console.error('Missing DOM elements:', {
                    bookGrid: !!bookGrid,
                    searchInput: !!searchInput,
                    searchButton: !!searchButton,
                    cartCount: !!cartCount,
                    wishlistCount: !!wishlistCount,
                    cartModal: !!cartModal,
                    wishlistModal: !!wishlistModal
                });
                showError('Application failed to load. Check console for details.');
                return;
            }
            fetchBooks();
        });

        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                const query = searchInput.value.trim() || 'javascript';
                console.log('Search triggered with query:', query);
                fetchBooks(query);
            });
        } else {
            console.error('searchButton or searchInput not found');
        }

        if (bookGrid) {
            bookGrid.addEventListener('click', (event) => {
                handleLike(event);
                handleCart(event);
                handleWishlist(event);
                handleCommentToggle(event);
            });
            bookGrid.addEventListener('submit', handleCommentSubmit);
        } else {
            console.error('bookGrid not found for event listeners');
        }

        if (cartToggle && cartModal) {
            cartToggle.addEventListener('click', () => {
                renderModalItems(cartItemsContainer, cartBooks, 'cart');
                cartModal.classList.add('active');
                console.log('Cart modal opened');
            });
        }

        if (wishlistToggle && wishlistModal) {
            wishlistToggle.addEventListener('click', () => {
                renderModalItems(wishlistItemsContainer, wishlistBooks, 'wishlist');
                wishlistModal.classList.add('active');
                console.log('Wishlist modal opened');
            });
        }

        if (closeCart && closeWishlist && cartModal && wishlistModal) {
            document.addEventListener('click', handleModal);
        } else {
            console.error('Modal close elements not found');
        }

        // Store book data on cards for modal rendering
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('cart-button') || event.target.classList.contains('wishlist-button')) {
                const card = event.target.closest('.book-card');
                if (card && !card.bookData) {
                    const bookId = event.target.dataset.id;
                    const book = {
                        id: bookId,
                        volumeInfo: {
                            title: card.querySelector('h3')?.textContent || 'No Title',
                            authors: card.querySelector('.book-card-content p:nth-child(2)')?.textContent.split(', ') || ['Unknown Author'],
                            imageLinks: { thumbnail: card.querySelector('img')?.src || 'https://via.placeholder.com/150' }
                        }
                    };
                    card.bookData = book;
                }
            }
        });