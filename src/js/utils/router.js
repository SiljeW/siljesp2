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
    module: () => import('../pages/home.js'),
    requiresAuth: false
  },
  {
    path: '/account/pet-detail/:id',
    module: () => import('../pages/petdetails.js'),
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

/**
 * Initialize the router
 */
function init() {
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
 * Extract parameters from dynamic routes
 * @param {string} routePath - Route path pattern
 * @param {string} currentPath - Current URL path
 * @returns {Object|null} - Object with parameters or null if no match
 */
function extractParams(routePath, currentPath) {
  // Check if this is a dynamic route
  if (!routePath.includes(':')) {
    return null;
  }
  
  // Convert route pattern to regex
  const paramNames = [];
  const regexPattern = routePath.replace(/:[^\/]+/g, (match) => {
    paramNames.push(match.substring(1));
    return '([^/]+)';
  });
  
  // Create regex with start and end anchors
  const regex = new RegExp(`^${regexPattern}$`);
  const match = currentPath.match(regex);
  
  if (!match) {
    return null;
  }
  
  // Create params object from matches
  const params = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });
  
  return params;
}

/**
 * Handle the current route
 */
async function handleRoute() {
  const path = window.location.pathname;
  
  // Find matching route and extract params
  let matchedRoute = null;
  let params = {};
  
  // First try to find an exact match
  matchedRoute = routes.find(route => route.path === path);
  
  // If no exact match, check for dynamic routes
  if (!matchedRoute) {
    for (const route of routes) {
      // Skip non-string paths (e.g., regex or catch-all)
      if (typeof route.path !== 'string' || route.path === '*') {
        continue;
      }
      
      // Check if it's a dynamic route
      if (route.path.includes(':')) {
        const extractedParams = extractParams(route.path, path);
        if (extractedParams) {
          matchedRoute = route;
          params = extractedParams;
          break;
        }
      }
    }
  }
  
  // If still no match, try regex routes
  if (!matchedRoute) {
    const regexRoute = routes.find(r => r.path instanceof RegExp && r.path.test(path));
    if (regexRoute) {
      matchedRoute = regexRoute;
      // Use the route's params function if available
      if (regexRoute.params) {
        params = regexRoute.params(path);
      }
    }
  }
  
  // Finally, fall back to the catch-all route
  if (!matchedRoute) {
    matchedRoute = routes.find(r => r.path === '*');
  }
  
  // Handle the matched route
  if (matchedRoute) {
    // Check auth requirements
    if (matchedRoute.requiresAuth && !isAuthenticated()) {
      navigateTo('/account/login');
      return;
    }
    
    if (matchedRoute.requiresGuest && isAuthenticated()) {
      navigateTo('/');
      return;
    }
    
    // Handle redirects
    if (matchedRoute.redirect) {
      navigateTo(matchedRoute.redirect);
      return;
    }
    
    // Load template if specified
    if (matchedRoute.template) {
      try {
        const response = await fetch(matchedRoute.template);
        if (response.ok) {
          const html = await response.text();
          document.getElementById('app').innerHTML = html;
        }
      } catch (error) {
        console.error('Error loading template:', error);
      }
    }
    
    // Render or load module
    if (matchedRoute.render) {
      matchedRoute.render();
    } else if (matchedRoute.module) {
      try {
        const module = await matchedRoute.module();
        
        if (module && module.init) {
          // Pass extracted params to the module's init function
          module.init(params);
        }
      } catch (error) {
        console.error('Error loading module:', error);
        // Display error message
        document.getElementById('app').innerHTML = `
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4 max-w-xl mx-auto">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> Failed to load page module.</span>
          </div>
        `;
      }
    }
  }
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