/**
 * Router utility
 * Handles client-side routing functionality
 */

import { isAuthenticated } from '../api/auth.js';

// Route definitions with their corresponding page modules and auth requirements
const routes = [
  {
    path: '/',
    module: () => import('../pages/home.js'),
    requiresAuth: false
  },
  {
    path: '/pets',
    module: () => import('../pages/home.js'), // Assuming the same as home for now
    requiresAuth: false
  },
  {
    path: '/pets/',
    redirect: '/pets'
  },
  {
    path: '/account/login',
    module: () => import('../pages/auth/login.js'),
    requiresAuth: false,
    requiresGuest: true
  },
  {
    path: '/account/register',
    module: () => import('../pages/auth/register.js'),
    requiresAuth: false,
    requiresGuest: true
  },
  {
    path: '/account/profile',
    module: () => import('../pages/auth/profile.js'),
    requiresAuth: false,
    requiresGuest: true
  },
  {
    // Default - not found
    path: '*',
    render: () => {
      const appElement = document.getElementById('app');
      if (appElement) {
        appElement.innerHTML = `
          <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-xl text-gray-600 mb-8">Page not found</p>
            <a href="/" class="px-6 py-3 bg-purple-900 text-white rounded-md hover:bg-purple-700 transition">
              Go to Homepage
            </a>
          </div>
        `;
      }
    }
  }
];

// Adds more specific routes dynamically (for pet details, etc.)
function addDynamicRoutes() {
  // Pet details page
  routes.push({
    path: /^\/pets\/([a-zA-Z0-9-_]+)\/?$/,
    module: () => import('../pages/petdetails.js'),
    requiresAuth: false,
    params: (path) => {
      const match = path.match(/^\/pets\/([a-zA-Z0-9-_]+)\/?$/);
      return match ? { id: match[1] } : {};
    }
  });
  
  // Pet edit page
  routes.push({
    path: /^\/pets\/([a-zA-Z0-9-_]+)\/edit\/?$/,
    module: () => import('../pages/pet-edit.js'),
    requiresAuth: true,
    params: (path) => {
      const match = path.match(/^\/pets\/([a-zA-Z0-9-_]+)\/edit\/?$/);
      return match ? { id: match[1] } : {};
    }
  });
}

/**
 * Initialize the router
 */
function init() {
  // Add dynamic routes
  addDynamicRoutes();
  
  // Handle navigation
  window.addEventListener('popstate', handleRoute);
  
  // Handle clicks on links
  document.addEventListener('click', (e) => {
    // Find closest anchor element
    const anchor = e.target.closest('a');
    
    if (anchor && anchor.getAttribute('href') && 
        !anchor.getAttribute('href').startsWith('http') && 
        !anchor.getAttribute('target') && 
        !anchor.hasAttribute('download')) {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      navigateTo(href);
    }
  });
  
  // Initial route
  handleRoute();
}

/**
 * Handle the current route
 */
async function handleRoute() {
  const path = window.location.pathname;

  // Find matching route
  let route = findRoute(path);
  
  // Check auth requirements
  if (route.requiresAuth && !isAuthenticated()) {
    navigateTo('/account/login');
    return;
  }
  
  if (route.requiresGuest && isAuthenticated()) {
    navigateTo('/');
    return;
  }
  
  // Handle redirects
  if (route.redirect) {
    navigateTo(route.redirect);
    return;
  }
  
  // Render or load module
  if (route.render) {
    route.render();
  } else if (route.module) {
    try {
      const params = route.params ? route.params(path) : {};
      const module = await route.module();
      
      if (module && module.init) {
        module.init(params);
      }
    } catch (error) {
      console.error('Error loading module:', error);
      navigateTo('/');
    }
  }
}

/**
 * Find a matching route for the given path
 * @param {string} path - The current path
 * @returns {Object} - The matching route
 */
function findRoute(path) {
  // First check for exact matches
  let route = routes.find(r => r.path === path);
  
  // Then check for regex patterns
  if (!route) {
    route = routes.find(r => r.path instanceof RegExp && r.path.test(path));
  }
  
  // Finally, fall back to the catch-all route
  if (!route) {
    route = routes.find(r => r.path === '*');
  }
  
  return route;
}

/**
 * Navigate to a different path
 * @param {string} path - The path to navigate to
 */
function navigateTo(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    handleRoute();
  }
}

export {
  init,
  navigateTo,
  handleRoute
};