/**
 * Router utility
 * Handles client-side routing functionality
 */

import { isAuthenticated } from '../api/auth.mjs';

// Route definitions with their corresponding page modules and auth requirements
const routes = [
  {
    path: '/',
    module: () => import('../../../src/main'),
    requiresAuth: false
  },
  {
    path: '/pets.html',
    module: () => import('../pages/pet-details.mjs'),
    requiresAuth: false
  },
  {
    path: '/pets',
    module: () => import('../pages/pet-details.mjs'),
    requiresAuth: false
  },
  {
    path: '/listings.html',
    module: () => import('../pages/listings.mjs'),
    requiresAuth: false
  },
  {
    path: '/listings',
    module: () => import('../pages/listings.mjs'),
    requiresAuth: false
  },
  {
    path: '/pets/:id',
    module: () => import('../pages/pet-details.mjs'),
    requiresAuth: false
  },
  {
    path: '/account/pet-detail/:id',
    module: () => import('../pages/petdetails.mjs'),
    requiresAuth: false,
    requiresGuest: true
  },
  {
    path: '/pets/',
    redirect: '/listings.html'
  },
  {
    path: '/account/login',
    module: () => import('../pages/auth/login.mjs'),
    requiresAuth: false,
    requiresGuest: true
  },
  {
    path: '/account/register',
    module: () => import('../pages/auth/register.mjs'),
    requiresAuth: false,
    requiresGuest: true
  },
  {
    path: '/account/profile',
    module: () => import('../pages/auth/profile.mjs'),
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

  // Handle query parameters for pet details page
  if (window.location.pathname.includes('pets.html') && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id');
    
    if (petId) {
      console.log('Pet details page with ID:', petId);
      // Let the pet-details module handle this
    }
  }
  
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
  console.log('Handling route:', path);
  
  // Extract query parameters
  const queryParams = {};
  const urlSearchParams = new URLSearchParams(window.location.search);
  for (const [key, value] of urlSearchParams.entries()) {
    queryParams[key] = value;
  }
  
  // Find matching route and extract params
  let matchedRoute = null;
  let params = { ...queryParams }; // Include query params by default
  
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
          params = { ...params, ...extractedParams };
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
        params = { ...params, ...regexRoute.params(path) };
      }
    }
  }
  
  // Special case for pets.html with query parameter
  if (path === '/pets.html' && params.id) {
    console.log('Handling pet details page with ID:', params.id);
    // This will be handled properly by the pet-details module
  }
  
  // Finally, fall back to the catch-all route
  if (!matchedRoute) {
    matchedRoute = routes.find(r => r.path === '*');
  }
  
  // Handle the matched route
  if (matchedRoute) {
    console.log('Matched route:', matchedRoute.path);
    
    // Check auth requirements
    if (matchedRoute.requiresAuth && !isAuthenticated()) {
      console.log('Authentication required, redirecting to login');
      navigateTo('/account/login');
      return;
    }
    
    if (matchedRoute.requiresGuest && isAuthenticated()) {
      console.log('Guest access only, redirecting to home');
      navigateTo('/');
      return;
    }
    
    // Handle redirects
    if (matchedRoute.redirect) {
      console.log('Redirecting to:', matchedRoute.redirect);
      navigateTo(matchedRoute.redirect);
      return;
    }
    
    // Load template if specified
    if (matchedRoute.template) {
      try {
        console.log('Loading template:', matchedRoute.template);
        const response = await fetch(matchedRoute.template);
        if (response.ok) {
          const html = await response.text();
          const appElement = document.getElementById('app');
          if (appElement) {
            appElement.innerHTML = html;
          }
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
        console.log('Loading module for route:', matchedRoute.path);
        const module = await matchedRoute.module();
        
        if (module && module.init) {
          // Pass extracted params to the module's init function
          console.log('Initializing module with params:', params);
          module.init(params);
        } else {
          console.warn('Module loaded but no init function found');
        }
      } catch (error) {
        console.error('Error loading module:', error);
        // Display error message
        const appElement = document.getElementById('app');
        if (appElement) {
          appElement.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4 max-w-xl mx-auto">
              <strong class="font-bold">Error!</strong>
              <span class="block sm:inline"> Failed to load page module.</span>
            </div>
          `;
        }
      }
    }
  } else {
    console.warn('No route matched for path:', path);
  }
}

/**
 * Navigate to a different path
 * @param {string} path - The path to navigate to
 */
function navigateTo(path) {
  if (window.location.pathname !== path) {
    console.log('Navigating to:', path);
    window.history.pushState({}, '', path);
    handleRoute();
  }
}

export {
  init,
  navigateTo,
  handleRoute
};