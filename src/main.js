/**
 * Main entry point for index.html (Home page)
 * This file should only handle the home page, not all pages
 */

// Import shared styles
import './style.css';

// Import shared components
import './js/components/header.mjs';
import './js/components/footer.mjs';

// Import home page functionality
import { init as initHomePage } from './js/pages/home.mjs';
import { isAuthenticated, getCurrentUser } from './js/api/auth.mjs';

/**
 * Initialize the home page only
 */
function init() {
  console.log('Initializing home page...');
  
  // Update UI based on authentication state
  updateAuthUI();
  
  // Initialize home page functionality
  initHomePage();
  
  // Initialize global event listeners for this page
  initGlobalEvents();
  
  console.log('Home page initialized');
}

/**
 * Update UI elements based on authentication state
 */
function updateAuthUI() {
  const isLoggedIn = isAuthenticated();
  console.log('Authentication state:', isLoggedIn ? 'logged in' : 'logged out');
  
  const authButtons = document.querySelector('#auth-buttons');
  const userMenu = document.querySelector('#user-menu');
  
  // Update navigation based on auth state
  if (authButtons && userMenu) {
    if (isLoggedIn) {
      const user = getCurrentUser();
      console.log('Current user:', user);
      
      // Show user menu
      authButtons.classList.add('hidden');
      userMenu.classList.remove('hidden');
      
      // Update user name if element exists
      const userNameElement = document.querySelector('#user-name');
      if (userNameElement && user) {
        userNameElement.textContent = user.name || 'User';
      }
    } else {
      // Show auth buttons
      authButtons.classList.remove('hidden');
      userMenu.classList.add('hidden');
    }
  }
  
  // Show/hide admin-only elements
  const adminElements = document.querySelectorAll('[data-admin-only]');
  adminElements.forEach(element => {
    if (isLoggedIn) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  });
  
  // Update any pet-specific UI elements
  const addPetButton = document.querySelector('#add-pet-button');
  if (addPetButton) {
    if (isLoggedIn) {
      addPetButton.classList.remove('hidden');
    } else {
      addPetButton.classList.add('hidden');
    }
  }
}

/**
 * Initialize event listeners for the home page
 */
function initGlobalEvents() {
  // Handle logout button click
  const logoutButton = document.querySelector('#logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Logout button clicked');
      
      // Import logout function and handle logout
      import('./js/api/auth.mjs').then(({ logout }) => {
        logout();
        console.log('User logged out successfully');
        
        // Update UI immediately
        updateAuthUI();
        
        // Redirect to home page
        window.location.href = '/';
      }).catch(error => {
        console.error('Error during logout:', error);
      });
    });
  }
  
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Page error:', event.error);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing home page');
  init();
});

// Export for other modules if needed
export { updateAuthUI };