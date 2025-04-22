/**
 * Register page handler
 * Manages the registration form functionality
 */

import { register, storeUserData } from '../../api/auth.js';
import { validateEmail, validateRequired } from '../../utils/validation.js';
import { navigateTo } from '../../utils/router.js';

// DOM elements
let registerForm;
let nameInput;
let emailInput;
let passwordInput;
let errorElement;
let submitButton;

/**
 * Initialize the register page
 */
function init() {
  // Get DOM elements
  registerForm = document.getElementById('register-form');
  nameInput = document.getElementById('name');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  errorElement = document.getElementById('register-error');
  submitButton = document.querySelector('#register-form button[type="submit"]');
  
  // Add event listeners
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Add input validation
  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      validateRequired(nameInput, 'Name is required');
    });
  }
  
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
 * Handle registration form submission
 * @param {Event} event - Form submit event
 */
async function handleRegister(event) {
  event.preventDefault();
  
  // Disable form while processing
  setFormLoading(true);
  hideError();
  
  // Get form values
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Validate form
  if (!validateRegisterForm(name, email, password)) {
    setFormLoading(false);
    return;
  }
  
  try {
    // Attempt registration
    const userData = await register(name, email, password);
    
    // Store user data
    storeUserData(userData);
    
    // Redirect to homepage
    navigateTo = '/';
  } catch (error) {
    // Show error message
    showError(error.message || 'Registration failed. Please try again.');
    setFormLoading(false);
  }
}

/**
 * Validate the registration form
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {boolean} - Whether the form is valid
 */
function validateRegisterForm(name, email, password) {
  // Reset previous errors
  hideError();
  
  // Check if name is provided
  if (!name || !validateRequired(nameInput, 'Name is required')) {
    return false;
  }
  
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
      ? '<svg class="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Creating account...'
      : 'Register';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

export { init };