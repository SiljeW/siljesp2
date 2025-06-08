/**
 * Home page functionality
 * Manages pet listings and search on the homepage
 */

import '../../components/footer.mjs';
import '../../components/header.mjs';
import '../../../style.css';

import { isAuthenticated } from '../api/auth.mjs';

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
  console.log('Home page: initializing...');
  
  // Get DOM elements
  petListingsContainer = document.getElementById('pet-listings');
  
  // If not found, try alternative IDs
  if (!petListingsContainer) {
    petListingsContainer = document.getElementById('pet-card');
    console.log('Using pet-card as container');
  }
  
  searchInput = document.getElementById('search-input');
  searchForm = document.getElementById('search-form');
  
  console.log('Pet listings container found:', Boolean(petListingsContainer));
  
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
  if (state.isLoading || !petListingsContainer) {
    console.log('Cannot load pets: either already loading or container not found');
    return;
  }
  
  console.log('Loading pets...');
  
  // Set loading state
  state.isLoading = true;
  showLoadingState();
  
  try {
    // Calculate offset based on current page
    const offset = (state.currentPage - 1) * state.limit;
    
    // Import getAllPets dynamically to avoid circular dependencies
    const { getAllPets } = await import('../api/pets.mjs');
    
    // Fetch pets from API
    const petsData = await getAllPets({
      limit: state.limit,
      offset,
      sort: state.filters.sort,
      sortOrder: state.filters.sortOrder,
      query: state.searchQuery
    });
    
    console.log('Pets data received:', petsData);
    
    // Update pagination state
    if (petsData.meta && typeof petsData.meta.total === 'number') {
      state.totalPages = Math.ceil(petsData.meta.total / state.limit);
    }
    
    // Determine the array of pets to render
    const petsToRender = Array.isArray(petsData) ? petsData : 
                        (petsData.data && Array.isArray(petsData.data) ? petsData.data : []);
    
    console.log(`Rendering ${petsToRender.length} pets`);
    
    // Render pets
    renderPets(petsToRender);
    
    // Render pagination if there's more than one page
    if (state.totalPages > 1) {
      renderPagination();
    }
  } catch (error) {
    console.error('Failed to load pets:', error);
    showError('Failed to load pets. Please try again later.');
    
    // For debugging purposes, try rendering some mock pets if API fails
    renderMockPets();
  } finally {
    state.isLoading = false;
  }
}

/**
 * Handle search form submission
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
 * Go to a specific page
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
 * Show loading state
 */
function showLoadingState() {
  if (!petListingsContainer) return;
  
  petListingsContainer.innerHTML = `
    <div class="flex justify-center items-center py-12 w-full">
      <svg class="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  if (!petListingsContainer) return;
  
  petListingsContainer.innerHTML = `
    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative my-4 w-full" role="alert">
      <span class="block sm:inline">${message}</span>
    </div>
  `;
}

/**
 * Render pets to the page
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
      <div class="text-center py-12 col-span-full">
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
  
  // Check if container is itself a card or contains cards
  if (petListingsContainer.classList.contains('grid')) {
    // Container already has grid styling, add cards directly
    pets.forEach(pet => {
      const petCard = createPetCard(pet);
      petListingsContainer.appendChild(petCard);
    });
  } else {
    // Container is not a grid, create a grid inside it
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
}

/**
 * Create a card element for a pet
 */
function createPetCard(pet) {
  console.log('Creating card for pet:', pet.name);
  
  const card = document.createElement('div');
  card.className = 'bg-white rounded-md shadow-sm overflow-hidden';
  card.dataset.petId = pet.id;
  
  // Get pet image or use placeholder
  const imageUrl = pet.image?.url || '';
  
  card.innerHTML = `
    <div class="h-48 bg-gray-200 flex items-center justify-center">
      ${imageUrl ? `
        <img src="${imageUrl}" alt="${pet.name}" class="w-full h-full object-cover">
      ` : `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      `}
    </div>
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-800">${pet.name || 'Unnamed Pet'}</h3>
      <p class="text-sm text-gray-600 mt-1">${pet.breed || 'Unknown breed'}</p>
      <p class="text-sm text-gray-600">${pet.age ? `${pet.age} years old` : 'Age unknown'}</p>
      
      <div class="mt-4 flex justify-center">
        <a href="/pets.html?id=${pet.id}" class="px-6 py-2 bg-secondary text-white rounded hover:underline transition">View More</a>
      </div>
    </div>
  `;
  
  return card;
}

/**
 * Render mock pets for testing when API fails
 */
function renderMockPets() {
  console.log('Rendering mock pets for testing');
  
  const mockPets = [
    {
      id: 1,
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      image: { url: '' }
    },
    {
      id: 2,
      name: 'Max',
      breed: 'German Shepherd',
      age: 2,
      image: { url: '' }
    },
    {
      id: 3,
      name: 'Bella',
      breed: 'Labrador',
      age: 4,
      image: { url: '' }
    }
  ];
  
  renderPets(mockPets);
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

// Export the init function
export { init };