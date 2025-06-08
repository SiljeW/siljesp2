import './style.css'
import { init as initRouter } from './js/utils/router.mjs';
import { isAuthenticated, getCurrentUser } from './js/api/auth.mjs';

/**
 * Initialize the application
 */
function init() {
  console.log('Initializing PETsome application...');
  
  // Initialize router
  initRouter();
  
  // Update UI based on authentication state
  updateAuthUI();
  
  // Initialize page-specific content based on current path
  initCurrentPage();
  
  // Initialize any global event listeners
  initGlobalEvents();
  
  console.log('PETsome application initialized');
}

/**
 * Initialize the current page based on URL path
 */


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
  } else {
    console.log('Auth UI elements not found in current page');
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
 * Initialize global event listeners
 */
function initGlobalEvents() {
  // Handle logout button click
  const logoutButton = document.querySelector('#logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Logout button clicked');
      
      import('../src/js/pages/home.mjs').then(({ logout }) => {
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
  
  // Global error handler to catch script errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  // Listen for auth change events if you implement them
  document.addEventListener('auth:changed', () => {
    console.log('Auth state changed, updating UI');
    updateAuthUI();
  });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing app');
  init();
});

// Export functions for use in other files
export {
  updateAuthUI
};