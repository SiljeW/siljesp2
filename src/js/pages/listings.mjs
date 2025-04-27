/**
 * Pet Listings Page
 * Handles displaying all pets with search and filtering functionality
 */

import { isAuthenticated } from '../api/auth.mjs';
import { getAllPets, searchPets } from '../api/pets.mjs';

// DOM elements
let petListingsContainer;
let searchInput;
let searchForm;
let sortSelect;
let filterButtons;

// Pagination state
const state = {
  currentPage: 1,
  limit: 12, // Show more pets on the dedicated listings page
  totalPages: 0,
  isLoading: false,
  searchQuery: '',
  filters: {
    sort: 'created',
    sortOrder: 'desc'
  }
};

/**
 * Initialize the listings page
 */
function init() {
  console.log('Listings page: initializing...');
  
  // Get DOM elements
  petListingsContainer = document.getElementById('pet-listings');
  searchInput = document.getElementById('search-input');
  searchForm = document.getElementById('search-form');
  sortSelect = document.getElementById('sort-select');
  filterButtons = document.querySelectorAll('[data-filter]');
  
  console.log('Pet listings container found:', Boolean(petListingsContainer));
  
  // Add event listeners
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
    console.log('Search form listener attached');
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
    console.log('Sort select listener attached');
  }
  
  // Add filter button event listeners
  filterButtons.forEach(button => {
    button.addEventListener('click', handleFilterClick);
  });
  
  // Initialize "Add Pet" button visibility based on auth state
  const addPetButton = document.getElementById('add-pet-button');
  if (addPetButton) {
    if (isAuthenticated()) {
      addPetButton.classList.remove('hidden');
    } else {
      addPetButton.classList.add('hidden');
    }
    console.log('Add pet button visibility updated based on auth state');
  }
  
  // Listen for authentication changes
  document.addEventListener('auth:changed', updateAuthDependentUI);
  
  // Check for URL parameters (for direct links with search/filter)
  const urlParams = new URLSearchParams(window.location.search);
  
  // Apply URL parameters if they exist
  if (urlParams.has('q')) {
    state.searchQuery = urlParams.get('q');
    if (searchInput) searchInput.value = state.searchQuery;
  }
  
  if (urlParams.has('sort')) {
    const sortParam = urlParams.get('sort');
    if (sortParam.includes('_')) {
      const [sortField, sortDirection] = sortParam.split('_');
      state.filters.sort = sortField;
      state.filters.sortOrder = sortDirection;
      
      // Update sort select if it exists
      if (sortSelect) {
        sortSelect.value = sortParam;
      }
    }
  }
  
  if (urlParams.has('page')) {
    const pageParam = parseInt(urlParams.get('page'));
    if (!isNaN(pageParam) && pageParam > 0) {
      state.currentPage = pageParam;
    }
  }
  
  // Load initial pets
  loadPets();
}

/**
 * Update UI elements that depend on authentication state
 */
function updateAuthDependentUI() {
  const isLoggedIn = isAuthenticated();
  console.log('Updating UI for auth state:', isLoggedIn ? 'logged in' : 'logged out');
  
  // Update "Add Pet" button
  const addPetButton = document.getElementById('add-pet-button');
  if (addPetButton) {
    addPetButton.style.display = isLoggedIn ? 'inline-block' : 'none';
  }
}

/**
 * Load pets from the API
 */
async function loadPets() {
  if (state.isLoading || !petListingsContainer) {
    console.log('Cannot load pets: either already loading or container not found');
    return;
  }
  
  console.log('Loading pets...');
  
  // Set loading state
  state.isLoading = true;
  showLoadingState();
  
  // Update URL with current filters
  updateURL();
  
  try {
    // Calculate offset based on current page
    const offset = (state.currentPage - 1) * state.limit;
    
    let petsData;
    
    // Use search or regular get based on whether there's a query
    if (state.searchQuery) {
      petsData = await searchPets(state.searchQuery, {
        limit: state.limit,
        offset,
        sort: state.filters.sort,
        sortOrder: state.filters.sortOrder
      });
    } else {
      petsData = await getAllPets({
        limit: state.limit,
        offset,
        sort: state.filters.sort,
        sortOrder: state.filters.sortOrder
      });
    }
    
    console.log('Pets data received:', petsData);
    
    // Update pagination state
    if (petsData.meta && typeof petsData.meta.total === 'number') {
      state.totalPages = Math.ceil(petsData.meta.total / state.limit);
      console.log(`Total pages: ${state.totalPages}`);
    }
    
    // Get the pets array from the response
    const petsToRender = petsData.data && Array.isArray(petsData.data) ? petsData.data : [];
    
    console.log(`Rendering ${petsToRender.length} pets`);
    
    // Render pets
    renderPets(petsToRender);
    
    // Render pagination
    renderPagination();
    
    // Update result count display if it exists
    const resultCount = document.getElementById('result-count');
    if (resultCount) {
      const totalCount = petsData.meta?.total || petsToRender.length;
      resultCount.textContent = `${totalCount} pet${totalCount !== 1 ? 's' : ''} found`;
    }
  } catch (error) {
    console.error('Failed to load pets:', error);
    showError('Failed to load pets. Please try again later.');
  } finally {
    state.isLoading = false;
  }
}

/**
 * Update the URL with current state
 */
function updateURL() {
  // Create URL parameters based on current state
  const params = new URLSearchParams();
  
  if (state.searchQuery) {
    params.set('q', state.searchQuery);
  }
  
  if (state.currentPage > 1) {
    params.set('page', state.currentPage);
  }
  
  // Add sort parameters
  params.set('sort', `${state.filters.sort}_${state.filters.sortOrder}`);
  
  // Update URL without reloading the page
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newURL);
}

/**
 * Render pets to the page
 * @param {Array} pets - Array of pet objects
 */
function renderPets(pets) {
  if (!petListingsContainer) {
    console.error('Pet listings container not found!');
    return;
  }
  
  console.log(`Rendering ${pets.length} pets to container`);
  
  // Clear container
  petListingsContainer.innerHTML = '';
  
  if (!pets || pets.length === 0) {
    petListingsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
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
  
  // Add each pet to the container
  pets.forEach(pet => {
    const petCard = createPetCard(pet);
    petListingsContainer.appendChild(petCard);
  });
}

/**
 * Create a card element for a pet
 * @param {Object} pet - Pet data
 * @returns {HTMLElement} - Pet card element
 */
function createPetCard(pet) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
  card.dataset.petId = pet.id;
  
  // Get pet image or use placeholder
  const imageUrl = pet.media && pet.media.length > 0 ? pet.media[0].url : 
                   (pet.image?.url || '');
  
  card.innerHTML = `
    <div class="relative">
      <div class="h-48 bg-gray-200 flex items-center justify-center">
        ${imageUrl ? `
          <img src="${imageUrl}" alt="${pet.name || 'Pet'}" class="w-full h-full object-cover">
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
        <a href="/pets.html?id=${pet.id}" class="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition">View More</a>
      </div>
    </div>
  `;
  
  return card;
}

/**
 * Render pagination controls
 */
function renderPagination() {
  // Remove any existing pagination first
  const existingPagination = document.querySelector('.pagination-container');
  if (existingPagination) {
    existingPagination.remove();
  }
  
  // Don't render pagination if there's only one page
  if (state.totalPages <= 1) {
    return;
  }
  
  // Create pagination container
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'flex justify-center mt-8 pagination-container';
  
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
 * Handle sort select change
 * @param {Event} event - Change event
 */
function handleSortChange(event) {
  const sortValue = event.target.value;
  
  if (sortValue && sortValue.includes('_')) {
    const [sortField, sortDirection] = sortValue.split('_');
    
    state.filters.sort = sortField;
    state.filters.sortOrder = sortDirection;
    state.currentPage = 1; // Reset to first page
    
    loadPets();
  }
}

/**
 * Handle filter button click
 * @param {Event} event - Click event
 */
function handleFilterClick(event) {
  const button = event.currentTarget;
  const filterType = button.dataset.filter;
  
  // Remove active class from all buttons in the same group
  document.querySelectorAll(`[data-filter-group="${button.dataset.filterGroup}"]`)
    .forEach(btn => btn.classList.remove('bg-purple-600', 'text-white'));
  
  // Add active class to clicked button
  button.classList.add('bg-purple-600', 'text-white');
  
  // Apply filter
  if (filterType === 'all') {
    // Clear this type of filter
    delete state.filters[button.dataset.filterGroup];
  } else {
    // Set this filter
    state.filters[button.dataset.filterGroup] = filterType;
  }
  
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
  
  // Create skeleton loader
  const skeletonHTML = Array(6).fill(0).map(() => `
    <div class="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
      <div class="h-48 bg-gray-200"></div>
      <div class="p-4">
        <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
      </div>
    </div>
  `).join('');
  
  petListingsContainer.innerHTML = skeletonHTML;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  if (!petListingsContainer) return;
  
  petListingsContainer.innerHTML = `
    <div class="col-span-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative my-4" role="alert">
      <span class="block sm:inline">${message}</span>
    </div>
  `;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);