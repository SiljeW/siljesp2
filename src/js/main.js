/**
 * Main application entry point
 * Initializes the app and handles global state
 */
import './style.css'
import { init as initRouter } from './utils/router.mjs';
import { isAuthenticated, getCurrentUser } from './api/auth.mjs';

/**
 * Initialize the application
 */
function init() {
  // Initialize router
  initRouter();
  
  // Update UI based on authentication state
  updateAuthUI();
  
  // Initialize any global event listeners
  initGlobalEvents();
  
  console.log('PETsome application initialized');
}

/**
 * Update UI elements based on authentication state
 */
function updateAuthUI() {
  const isLoggedIn = isAuthenticated();
  const authButtons = document.querySelector('#auth-buttons');
  const userMenu = document.querySelector('#user-menu');
  
  // Update navigation based on auth state
  if (authButtons && userMenu) {
    if (isLoggedIn) {
      const user = getCurrentUser();
      
      // Show user menu
      authButtons.classList.add('hidden');
      userMenu.classList.remove('hidden');
      
      // Update user name if element exists
      const userNameElement = document.querySelector('#user-name');
      if (userNameElement && user) {
        userNameElement.textContent = user.name;
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
}

/**
 * Initialize global event listeners
 */
function initGlobalEvents() {
  // Handle logout button click
  const logoutButton = document.querySelector('#logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      import('./api/auth.mjs').then(({ logout }) => {
        logout();
        window.location.href = '/';
      });
    });
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for use in other files
export {
  updateAuthUI
};