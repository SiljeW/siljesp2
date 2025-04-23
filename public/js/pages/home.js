/**
 * Home page handler
 * Manages the homepage and pet listings
 */

import { getPets } from '../api/pets.js.bak';
import { isAuthenticated } from '../api/auth.js';

// DOM elements
let petListingsContainer;
let searchInput;
let searchForm;

// Pagination state
const state = {
  currentPage: 1,
  limit: 9,
  totalPages: 0,
  isLoading: false,
  searchQuery: '',
  filters: {
    sort: 'created',
    sortOrder: 'desc'
  }
};

/**
 * Initialize the home page
 */
function init() {
  // Get DOM elements
  petListingsContainer = document.getElementById('pet-listings');
  searchInput = document.getElementById('search-input');
  searchForm = document.getElementById('search-form');
  
  // Add event listeners
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  // Initialize "Add Pet" button visibility based on auth state
  const addPetButton = document.getElementById('add-pet-button');
  if (addPetButton) {
    if (isAuthenticated()) {
      addPetButton.classList.remove('hidden');
    } else {
      addPetButton.classList.add('hidden');
    }
  }
  
  // Load initial pets
  loadPets();
}

/**
 * Load pets from the API
 */
async function loadPets() {
  if (state.isLoading || !petListingsContainer) return;
  
  // Set loading state
  state.isLoading = true;
  showLoadingState();
  
  try {
    // Calculate offset based on current page
    const offset = (state.currentPage - 1) * state.limit;
    
    // Fetch pets from API
    const petsData = await getPets({
      limit: state.limit,
      offset,
      sort: state.filters.sort,
      sortOrder: state.filters.sortOrder,
      query: state.searchQuery
    });
    
    // Update pagination state
    state.totalPages = Math.ceil(petsData.meta.total / state.limit);
    
    // Render pets
    renderPets(petsData.data);
    
    // Render pagination if there's more than one page
    if (state.totalPages > 1) {
      renderPagination();
    }
  } catch (error) {
    showError('Failed to load pets. Please try again later.');
  } finally {
    state.isLoading = false;
  }
}

/**
 * Render pets to the page
 * @param {Array} pets - Array of pet objects
 */
function renderPets(pets) {
  if (!petListingsContainer) return;
  
  // Clear container
  petListingsContainer.innerHTML = '';
  
  if (!pets || pets.length === 0) {
    petListingsContainer.innerHTML = `
      <div class="text-center py-12">
        <p class="text-gray-500 text-lg">No pets found</p>
        ${state.searchQuery ? `
          <button id="clear-search" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Clear Search
          </button>
        ` : ''}
      </div>
    `;
    
    // Add event listener to clear search button
    const clearSearchButton = document.getElementById('clear-search');
    if (clearSearchButton) {
      clearSearchButton.addEventListener('click', clearSearch);
    }
    
    return;
  }
  
  // Create grid for pets
  const petsGrid = document.createElement('div');
  petsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
  
  // Add each pet to the grid
  pets.forEach(pet => {
    const petCard = createPetCard(pet);
    petsGrid.appendChild(petCard);
  });
  
  // Add grid to container
  petListingsContainer.appendChild(petsGrid);
}

/**
 * Create a card element for a pet
 * @param {Object} pet - Pet data
 * @returns {HTMLElement} - Pet card element
 */
function createPetCard(pet) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
  
  // Get pet image or use placeholder
  const imageUrl = pet.image?.url || '';
  
  card.innerHTML = `
    <div class="relative pb-2/3">
      <div class="h-48 bg-gray-200 flex items-center justify-center">
        ${imageUrl ? `
          <img src="${imageUrl}" alt="${pet.name}" class="w-full h-full object-cover">
        ` : `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        `}
      </div>
    </div>
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-800">${pet.name || 'Unnamed Pet'}</h3>
      <p class="text-sm text-gray-600 mt-1">${pet.breed || 'Unknown breed'}</p>
      <p class="text-sm text-gray-600">${pet.age ? `${pet.age} years old` : 'Age unknown'}</p>
      <div class="mt-4 flex justify-center">
        <a href="/pets/${pet.id}" class="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition">View More</a>
      </div>
    </div>
  `;
  
  return card;
}

/**
 * Render pagination controls
 */
function renderPagination() {
  // Create pagination container
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'flex justify-center mt-8';
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = `px-3 py-1 rounded-l border ${state.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-purple-600 hover:bg-purple-50'}`;
  prevButton.innerHTML = '&laquo; Previous';
  prevButton.disabled = state.currentPage === 1;
  
  if (state.currentPage > 1) {
    prevButton.addEventListener('click', () => goToPage(state.currentPage - 1));
  }
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = `px-3 py-1 rounded-r border ${state.currentPage === state.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-purple-600 hover:bg-purple-50'}`;
  nextButton.innerHTML = 'Next &raquo;';
  nextButton.disabled = state.currentPage === state.totalPages;
  
  if (state.currentPage < state.totalPages) {
    nextButton.addEventListener('click', () => goToPage(state.currentPage + 1));
  }
  
  // Page buttons
  const pageButtons = document.createElement('div');
  pageButtons.className = 'flex';
  
  // Determine which page buttons to show
  let startPage = Math.max(1, state.currentPage - 2);
  let endPage = Math.min(state.totalPages, startPage + 4);
  
  // Adjust if we're near the end
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `px-3 py-1 border-t border-b border-r ${i === state.currentPage ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'}`;
    pageButton.textContent = i;
    
    if (i !== state.currentPage) {
      pageButton.addEventListener('click', () => goToPage(i));
    }
    
    pageButtons.appendChild(pageButton);
  }
  
  // Assemble pagination
  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(pageButtons);
  paginationContainer.appendChild(nextButton);
  
  // Add to DOM
  petListingsContainer.insertAdjacentElement('afterend', paginationContainer);
}

/**
 * Go to a specific page
 * @param {number} page - Page number
 */
function goToPage(page) {
  state.currentPage = page;
  loadPets();
  
  // Scroll to top of listings
  if (petListingsContainer) {
    petListingsContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Handle search form submission
 * @param {Event} event - Form submit event
 */
function handleSearch(event) {
  event.preventDefault();
  
  if (!searchInput) return;
  
  state.searchQuery = searchInput.value.trim();
  state.currentPage = 1; // Reset to first page
  loadPets();
}

/**
 * Clear search and reset listings
 */
function clearSearch() {
  if (searchInput) {
    searchInput.value = '';
  }
  
  state.searchQuery = '';
  state.currentPage = 1;
  loadPets();
}

/**
 * Show loading state
 */
function showLoadingState() {
  if (!petListingsContainer) return;
  
  petListingsContainer.innerHTML = `
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
  if (!petListingsContainer) return;
  
  petListingsContainer.innerHTML = `
    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative my-4" role="alert">
      <span class="block sm:inline">${message}</span>
    </div>
  `;
}

// Export functions
export {
  init
};