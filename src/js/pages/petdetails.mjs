/**
 * Pet Details page
 * Displays detailed information about a specific pet
 */

import { getPetById } from '../api/pets.mjs';
import { isAuthenticated } from '../api/auth.mjs';


/**
 * Initialize the pet details page
 * @param {Object} params - Route parameters including pet ID
 */
async function init(params = {}) {
  const petDetailsContainer = document.getElementById('petdetails');
  
  if (!petDetailsContainer) return;
  
  // Extract pet ID from params
  const petId = params.id;
  
  if (!petId) {
    showError('Pet ID not provided');
    return;
  }
  
  // Show loading state
  showLoading();
  
  try {
    // Fetch pet details
    const pet = await getPetById(petId);
    
    // Render pet details
    renderPetDetails(pet);
    
    // Attach event listeners
    attachEventListeners(pet);
  } catch (error) {
    showError('Failed to load pet details. Please try again later.');
  }
}

/**
 * Render pet details
 * @param {Object} pet - Pet data
 */
function renderPetDetails(pet) {
  const petDetailsContainer = document.getElementById('petdetails');
  
  if (!petDetailsContainer || !pet) return;
  
  // Clear container
  petDetailsContainer.innerHTML = '';
  
  // Get pet image or use placeholder
  const imageUrl = pet.image?.url || '';
  
  // Create details markup
  const detailsContent = document.createElement('div');
  detailsContent.className = 'bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto';
  
  detailsContent.innerHTML = `
    <div class="md:flex">
      <div class="md:w-1/2">
        <div class="h-64 md:h-full bg-gray-200 flex items-center justify-center">
          ${imageUrl ? `
            <img src="${imageUrl}" alt="${pet.name}" class="w-full h-full object-cover">
          ` : `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          `}
        </div>
      </div>
      
      <div class="md:w-1/2 p-6">
        <div class="flex justify-between items-start">
          <h1 class="text-3xl font-bold text-gray-800">${pet.name || 'Unnamed Pet'}</h1>
          
          <button id="share-pet-btn" class="text-purple-600 hover:text-purple-800" title="Share Pet">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        
        <div class="mt-4 space-y-3">
          <p class="flex items-center text-gray-700">
            <span class="font-semibold w-20">Breed:</span> 
            <span>${pet.breed || 'Not specified'}</span>
          </p>
          
          <p class="flex items-center text-gray-700">
            <span class="font-semibold w-20">Age:</span> 
            <span>${pet.age ? `${pet.age} years` : 'Not specified'}</span>
          </p>
          
          <p class="flex items-center text-gray-700">
            <span class="font-semibold w-20">Size:</span> 
            <span>${pet.size || 'Not specified'}</span>
          </p>
          
          <p class="flex items-center text-gray-700">
            <span class="font-semibold w-20">Color:</span> 
            <span>${pet.color || 'Not specified'}</span>
          </p>
        </div>
        
        <div class="mt-6">
          <h2 class="text-xl font-semibold mb-2">Description</h2>
          <p class="text-gray-700">${pet.description || 'No description available for this pet.'}</p>
        </div>
        
        <div class="mt-8 flex justify-between" id="action-buttons">
          <!-- Admin-only edit button will be added here if user is authenticated -->
          <a href="/pets" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">
            Back to Listings
          </a>
        </div>
      </div>
    </div>
  `;
  
  petDetailsContainer.appendChild(detailsContent);
  
  // Add edit button if user is authenticated
  if (isAuthenticated()) {
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
      const editButton = document.createElement('a');
      editButton.href = `/pets/${pet.id}/edit`;
      editButton.className = 'px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition';
      editButton.textContent = 'Edit Pet';
      
      // Insert as first child
      actionButtons.insertBefore(editButton, actionButtons.firstChild);
    }
  }
}

/**
 * Attach event listeners
 * @param {Object} pet - Pet data
 */
function attachEventListeners(pet) {
  // Share button
  const shareButton = document.getElementById('share-pet-btn');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      const petUrl = `${window.location.origin}/pets/${pet.id}`;
      
      // Try to use the clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(petUrl)
          .then(() => {
            alert('Link copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
            promptManualCopy(petUrl);
          });
      } else {
        promptManualCopy(petUrl);
      }
    });
  }
}

/**
 * Show a manual copy prompt for the URL
 * @param {string} url - URL to copy
 */
function promptManualCopy(url) {
  const input = document.createElement('input');
  input.value = url;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  alert('Link copied to clipboard!');
}

/**
 * Show loading state
 */
function showLoading() {
  const petDetailsContainer = document.getElementById('petdetails');
  
  if (!petDetailsContainer) return;
  
  petDetailsContainer.innerHTML = `
    <div class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  `;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const petDetailsContainer = document.getElementById('petdetails');
  
  if (!petDetailsContainer) return;
  
  petDetailsContainer.innerHTML = `
    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative my-4 max-w-2xl mx-auto" role="alert">
      <span class="block sm:inline">${message}</span>
    </div>
  `;
}

export { init };