/**
 * Header component
 * Manages the site header/navigation
 */

import { isAuthenticated, getCurrentUser, logout } from '../api/auth.mjs';


/**
 * Initialize the header component
 */
function init() {
  renderAuthState();
  attachEventListeners();
}

/**
 * Render the header based on authentication state
 */
function renderAuthState() {
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
  const mobileUserMenu = document.getElementById('mobile-user-menu');
  const adminActions = document.getElementById('admin-actions');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenuButtonLoggedIn = document.getElementById('mobile-menu-button-loggedin');
  
  if (!authButtons || !userMenu) return;
  
  if (isAuthenticated()) {
    // User is logged in
    const user = getCurrentUser();
    
    // Desktop UI
    authButtons.classList.add('hidden');
    userMenu.classList.remove('hidden');
    
    // Mobile UI
    if (mobileAuthButtons) mobileAuthButtons.classList.add('hidden');
    if (mobileUserMenu) {
      mobileUserMenu.classList.remove('hidden');
      mobileUserMenu.style.display = 'block'; 
    }
    
    // Toggle mobile menu buttons
    if (mobileMenuButton) mobileMenuButton.classList.add('hidden');
    if (mobileMenuButtonLoggedIn) mobileMenuButtonLoggedIn.classList.remove('hidden');
    
    // Update user information
    updateUserInfo(user);
    
    // Show admin actions if they exist
    if (adminActions) {
      adminActions.classList.remove('hidden');
    }
  } else {
    // User is not logged in
    
    // Desktop UI
    authButtons.classList.remove('hidden');
    userMenu.classList.add('hidden');
    
    // Mobile UI
    if (mobileAuthButtons) mobileAuthButtons.classList.remove('hidden');
    if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
    
    // Toggle mobile menu buttons
    if (mobileMenuButton) mobileMenuButton.classList.remove('hidden');
    if (mobileMenuButtonLoggedIn) mobileMenuButtonLoggedIn.classList.add('hidden');
    
    // Hide admin actions if they exist
    if (adminActions) {
      adminActions.classList.add('hidden');
    }
  }
}

/**
 * Update user information in UI
 * @param {Object} user - User object
 */
function updateUserInfo(user) {
  if (!user) return;
  
  // Update user initials
  const name = user.name || 'User';
  const initials = name.charAt(0).toUpperCase();
  
  const userInitialsElement = document.getElementById('user-initials');
  const mobileUserInitialsElement = document.getElementById('mobile-user-initials');
  const mobileUserNameElement = document.getElementById('mobile-user-name');
  
  if (userInitialsElement) userInitialsElement.textContent = initials;
  if (mobileUserInitialsElement) mobileUserInitialsElement.textContent = initials;
  if (mobileUserNameElement) mobileUserNameElement.textContent = name;
}

/**
 * Attach event listeners to header elements
 */
function attachEventListeners() {
  // Logout buttons
  const logoutButton = document.getElementById('logout-button');
  const mobileLogoutButton = document.getElementById('mobile-logout-button');
  
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener('click', handleLogout);
  }
  
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenuButtonLoggedIn = document.getElementById('mobile-menu-button-loggedin');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
  
  if (mobileMenuButtonLoggedIn && mobileMenu) {
    mobileMenuButtonLoggedIn.addEventListener('click', toggleMobileMenu);
  }
  
  // Profile dropdown toggle
  const profileButton = document.getElementById('profile-button');
  const profileDropdown = document.getElementById('profile-dropdown');
  
  if (profileButton && profileDropdown) {
    profileButton.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!profileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
      }
    });
  }
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const isExpanded = this.getAttribute('aria-expanded') === 'true';
  
  this.setAttribute('aria-expanded', !isExpanded);
  mobileMenu.classList.toggle('hidden');
}

/**
 * Handle user logout
 * @param {Event} event 
 */
async function handleLogout(event) {
  event.preventDefault();
  
  // Perform logout
  logout();
  
  // Update UI
  renderAuthState();
  
  // Redirect to homepage
  window.location.href = 'index.html';
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

// Export functions
export {
  init,
  renderAuthState
};