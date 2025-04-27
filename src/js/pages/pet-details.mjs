/**
 * Pet Details Page
 * Handles fetching and displaying detailed information about a single pet
 */

import { isAuthenticated } from '../api/auth.mjs';
import { getPetById } from '../api/pets.mjs';

// DOM elements
let petDetailsContainer;
let adoptButton;

/**
 * Initialize the pet details page
 */
function init() {
  console.log('Pet details page: initializing...');
  
  // Get DOM elements
  petDetailsContainer = document.getElementById('pet-details-container');
  
  // Update UI based on authentication state
  updateAuthDependentUI();
  
  // Listen for authentication changes
  document.addEventListener('auth:changed', updateAuthDependentUI);
  
  // Get pet ID from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('id');
  
  if (!petId) {
    showError('No pet ID provided. Please go back to the listings page and select a pet.');
    return;
  }
  
  // Load pet details
  loadPetDetails(petId);
}

/**
 * Update UI elements that depend on authentication state
 */
function updateAuthDependentUI() {
  const isLoggedIn = isAuthenticated();
  console.log('Authentication state:', isLoggedIn ? 'logged in' : 'logged out');
  
  // Update adopt/contact button visibility if it exists
  if (adoptButton) {
    if (isLoggedIn) {
      adoptButton.textContent = 'Contact About Adoption';
      adoptButton.classList.remove('hidden');
    } else {
      adoptButton.textContent = 'Login to Adopt';
      adoptButton.classList.remove('hidden');
      
      // Add click event to redirect to login if not authenticated
      adoptButton.addEventListener('click', () => {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
      });
    }
  }
}

/**
 * Load pet details from the API
 * @param {string|number} petId - The ID of the pet to load
 */
async function loadPetDetails(petId) {
  if (!petDetailsContainer) return;
  
  // Show loading state
  showLoadingState();
  
  try {
    // Fetch pet details
    const petData = await getPetById(petId);
    console.log('Pet details loaded:', petData);
    
    // Render pet details
    renderPetDetails(petData);
  } catch (error) {
    console.error('Failed to load pet details:', error);
    showError('Failed to load pet details. Please try again later.');
  }
}

/**
 * Render pet details to the page
 * @param {Object} pet - Pet data
 */
function renderPetDetails(pet) {
  if (!petDetailsContainer) return;
  
  console.log('Rendering pet details:', pet);
  
  // Get pet image URL or use placeholder
  const imageUrl = pet.media && pet.media.length > 0 ? pet.media[0].url : 
                  (pet.image?.url || '');
  
  // Format tags if available
  const tagsHtml = pet.tags && pet.tags.length > 0 
    ? `<div class="flex flex-wrap gap-2 mb-4">
        ${pet.tags.map(tag => `<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">${tag}</span>`).join('')}
      </div>`
    : '';
  
  // Format pet details
  petDetailsContainer.innerHTML = `
    <div class="mb-6">
      <a href="/index.html" class="text-purple-600 hover:underline flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to listings
      </a>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-gray-100 rounded-lg overflow-hidden h-80">
        ${imageUrl 
          ? `<img src="${imageUrl}" alt="${pet.name}" class="w-full h-full object-cover">`
          : `<div class="w-full h-full flex items-center justify-center bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>`
        }
      </div>
      
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">${pet.name || 'Unnamed Pet'}</h1>
        
        <div class="mb-4">
          <span class="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full mr-2">${pet.breed || 'Unknown breed'}</span>
          <span class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">${pet.age ? `${pet.age} years old` : 'Age unknown'}</span>
        </div>
        
        ${tagsHtml}
        
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">About</h2>
          <p class="text-gray-700">${pet.description || 'No description available for this pet.'}</p>
        </div>
        
        <button id="adopt-button" class="w-full py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-opacity-90 transition">
          Login to Adopt
        </button>
      </div>
    </div>
    
    ${pet.created ? `
      <div class="mt-8 text-sm text-gray-500">
        Listed on ${new Date(pet.created).toLocaleDateString()}
      </div>
    ` : ''}
  `;
  
  // Get adopt button and update its state
  adoptButton = document.getElementById('adopt-button');
  updateAuthDependentUI();
}

/**
 * Show loading state
 */
function showLoadingState() {
  if (!petDetailsContainer) return;
  
  petDetailsContainer.innerHTML = `
    <div class="animate-pulse">
      <div class="h-64 bg-gray-200 rounded mb-4"></div>
      <div class="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div class="h-24 bg-gray-200 rounded mb-4"></div>
    </div>
  `;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  if (!petDetailsContainer) return;
  
  petDetailsContainer.innerHTML = `
    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative my-4" role="alert">
      <span class="block sm:inline">${message}</span>
      <div class="mt-4">
        <a href="/index.html" class="text-red-600 underline">Return to homepage</a>
      </div>
    </div>
  `;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);