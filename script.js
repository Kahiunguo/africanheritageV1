// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const cartCount = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const checkoutBtn = document.querySelector('.checkout-btn');
const contactForm = document.getElementById('contactForm');

// Initialize cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Mobile menu toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('.scroll-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    window.scrollTo({
      top: targetElement.offsetTop - 80,
      behavior: 'smooth'
    });
  });
});

// Update cart count display
function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// Add to cart functionality
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    const productCard = button.closest('.product-card');
    const id = productCard.dataset.id;
    const name = productCard.dataset.name;
    const price = parseFloat(productCard.dataset.price);
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price,
        quantity: 1
      });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    
    // Show feedback
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.backgroundColor = '#2ecc71';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 1500);
  });
});

// Render cart items
function renderCartItems() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty</p>
        <a href="shop.html" class="btn btn-primary">Shop Now</a>
      </div>
    `;
    updateCartSummary();
    return;
  }
  
  cartItemsContainer.innerHTML = '';
  
  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-image">${item.name.split(' ')[0]}</div>
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="quantity-controls">
          <button class="quantity-btn decrease" data-id="${item.id}">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
          <button class="quantity-btn increase" data-id="${item.id}">+</button>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);
  });
  
  // Add event listeners to quantity controls
  document.querySelectorAll('.decrease').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      updateQuantity(id, -1);
    });
  });
  
  document.querySelectorAll('.increase').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      updateQuantity(id, 1);
    });
  });
  
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const newQuantity = parseInt(e.target.value);
      if (newQuantity > 0) {
        updateQuantity(id, newQuantity - cart.find(item => item.id === id).quantity);
      } else {
        e.target.value = 1;
      }
    });
  });
  
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      removeFromCart(id);
    });
  });
  
  updateCartSummary();
}

// Update item quantity
function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  
  if (item) {
    if (change === 1 || change === -1) {
      item.quantity += change;
      if (item.quantity < 1) item.quantity = 1;
    } else {
      // Direct quantity update
      item.quantity = change;
    }
    
    // Remove item if quantity is 0
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
  }
}

// Remove item from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartItems();
  updateCartCount();
}

// Update cart summary
function updateCartSummary() {
  const subtotalElement = document.querySelector('.subtotal');
  const totalElement = document.querySelector('.total-price');
  
  if (!subtotalElement || !totalElement) return;
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // Free shipping
  
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
}

// Checkout functionality
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    alert('Thank you for your order! Your purchase has been confirmed.');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
  });
}

// Contact form validation
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
    });
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    let isValid = true;
    
    // Validate name
    if (name === '') {
      document.getElementById('name-error').textContent = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
      document.getElementById('email-error').textContent = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      document.getElementById('email-error').textContent = 'Please enter a valid email';
      isValid = false;
    }
    
    // Validate message
    if (message === '') {
      document.getElementById('message-error').textContent = 'Message is required';
      isValid = false;
    }
    
    // If valid, show success message
    if (isValid) {
      alert('Thank you for your message! We will get back to you soon.');
      contactForm.reset();
    }
  });
}

// Initialize cart count on page load
updateCartCount();

// Render cart items if on cart page
if (cartItemsContainer) {
  renderCartItems();
}