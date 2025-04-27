/**
 * Validation utility functions
 * Provides form validation helpers
 */

/**
 * Validate if a value is not empty
 * @param {HTMLInputElement} inputElement - The input element to validate
 * @param {string} errorMessage - Error message to display if validation fails
 * @returns {boolean} - Whether validation passed
 */
function validateRequired(inputElement, errorMessage = 'This field is required') {
  if (!inputElement) return false;
  
  const value = inputElement.value.trim();
  const isValid = value.length > 0;
  
  updateValidationStatus(inputElement, isValid, errorMessage);
  
  return isValid;
}

/**
 * Validate if a value is a valid email
 * @param {HTMLInputElement} inputElement - The input element to validate
 * @param {string} errorMessage - Error message to display if validation fails
 * @returns {boolean} - Whether validation passed
 */
function validateEmail(inputElement, errorMessage = 'Please enter a valid email address') {
  if (!inputElement) return false;
  
  const value = inputElement.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(value);
  
  updateValidationStatus(inputElement, isValid, errorMessage);
  
  return isValid;
}

/**
 * Validate if two password fields match
 * @param {HTMLInputElement} passwordElement - The password input element
 * @param {HTMLInputElement} confirmElement - The confirm password input element
 * @param {string} errorMessage - Error message to display if validation fails
 * @returns {boolean} - Whether validation passed
 */
function validatePasswordMatch(passwordElement, confirmElement, errorMessage = 'Passwords do not match') {
  if (!passwordElement || !confirmElement) return false;
  
  const password = passwordElement.value;
  const confirm = confirmElement.value;
  const isValid = password === confirm;
  
  updateValidationStatus(confirmElement, isValid, errorMessage);
  
  return isValid;
}

/**
 * Validate if a value meets minimum length requirements
 * @param {HTMLInputElement} inputElement - The input element to validate
 * @param {number} minLength - Minimum required length
 * @param {string} errorMessage - Error message to display if validation fails
 * @returns {boolean} - Whether validation passed
 */
function validateMinLength(inputElement, minLength, errorMessage = `Must be at least ${minLength} characters`) {
  if (!inputElement) return false;
  
  const value = inputElement.value;
  const isValid = value.length >= minLength;
  
  updateValidationStatus(inputElement, isValid, errorMessage);
  
  return isValid;
}

/**
 * Update validation status UI
 * @param {HTMLInputElement} inputElement - The input element to update
 * @param {boolean} isValid - Whether the input is valid
 * @param {string} errorMessage - Error message to display if invalid
 */
function updateValidationStatus(inputElement, isValid, errorMessage) {
  // Get or create error message element
  let errorElement = inputElement.nextElementSibling;
  
  if (!errorElement || !errorElement.classList.contains('validation-error')) {
    errorElement = document.createElement('p');
    errorElement.classList.add('validation-error', 'text-red-500', 'text-sm', 'mt-1');
    inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
  }
  
  // Update input styling
  if (isValid) {
    inputElement.classList.remove('border-red-500');
    inputElement.classList.add('border-green-500');
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  } else {
    inputElement.classList.remove('border-green-500');
    inputElement.classList.add('border-red-500');
    errorElement.textContent = errorMessage;
    errorElement.classList.remove('hidden');
  }
  
  return isValid;
}

/**
 * Clear validation state for all inputs in a form
 * @param {HTMLFormElement} formElement - The form to clear validation for
 */
function clearValidation(formElement) {
  if (!formElement) return;
  
  const inputs = formElement.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.classList.remove('border-red-500', 'border-green-500');
    
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('validation-error')) {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
  });
}

export {
  validateRequired,
  validateEmail,
  validatePasswordMatch,
  validateMinLength,
  updateValidationStatus,
  clearValidation
};