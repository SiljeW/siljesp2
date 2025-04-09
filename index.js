/**
 * Application Entry Point
 * This file initializes the entire application
 */

// Import styles
import './style.css';

// Import components and utilities
import './js/components/header.js';
import './js/components/footer.js';
import { init as initRouter } from './js/utils/router.js';

/**
 * Initialize the application
 */
function init() {
  console.log('PETsome Application Starting...');
  
  // Initialize the router which will handle page navigation
  initRouter();
  
  console.log('PETsome Application Ready');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);