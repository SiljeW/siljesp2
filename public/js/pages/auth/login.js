/**
 * Login page handler
 * Manages the login form functionality
 */

import { login, storeUserData } from '../../api/auth.js';
import { validateEmail, validateRequired } from '../../utils/validation.js';
import { navigateTo } from '../../utils/router.js';

// DOM elements
let loginForm;
let emailInput;
let passwordInput;
let errorElement;
let submitButton;

/**
 * Initialize the login page
 */
function init() {
  // Get DOM elements
  loginForm = document.getElementById('login-form');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  errorElement = document.getElementById('login-error');
  submitButton = document.querySelector('#login-form button[type="submit"]');
  
  // Add event listeners
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Add input validation
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      validateEmail(emailInput, 'Please enter a valid email address');
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('blur', () => {
      validateRequired(passwordInput, 'Password is required');
    });
  }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();
  
  // Disable form while processing
  setFormLoading(true);
  hideError();
  
  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Validate form
  if (!validateLoginForm(email, password)) {
    setFormLoading(false);
    return;
  }
  
  try {
    // Attempt login
    const response = await login(email, password);
    
    console.log('Login successful, storing user...');
    console.log('response:', response);
    
    // Check if response has the expected structure
    if (!response || !response.data || !response.data.accessToken) {
      throw new Error('Login failed — missing user data or access token');
    }
    
    // Extract the user data from the nested structure
    const userData = response.data;
    
    // Store user data
    storeUserData(userData);
    
    setTimeout(() => {
      window.location.href = '/account/profile.html';
    }, 500);
  } catch (error) {
    // Show error message
    showError(error.message || 'Login failed. Please check your credentials and try again.');
    setFormLoading(false);
  }
}

/**
 * Validate the login form
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {boolean} - Whether the form is valid
 */
function validateLoginForm(email, password) {
  // Reset previous errors
  hideError();
  
  // Check if email is valid
  if (!email || !validateEmail(emailInput, 'Please enter a valid email address')) {
    return false;
  }
  
  // Check if password is provided
  if (!password || !validateRequired(passwordInput, 'Password is required')) {
    return false;
  }
  
  return true;
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }
}

/**
 * Hide error message
 */
function hideError() {
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  }
}

/**
 * Set form loading state
 * @param {boolean} isLoading - Whether the form is loading
 */
function setFormLoading(isLoading) {
  if (submitButton) {
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading 
      ? '<svg class="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Logging in...'
      : 'Login';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

export { init };