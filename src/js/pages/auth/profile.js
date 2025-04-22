import { getCurrentUser, getApiKey, getToken, logout } from '../../api/auth.js';
import { navigateTo } from '../../utils/router.js';
import { setGetPetFormListener, setGetAllPetsFormListener, setUpdatePetFormListener } from '../../handlers/index.js'
import { authFetch } from '../../utils/authFetch.js';

// DOM elements for user profile
let profileContent;
let profileName;
let logoutButton;

// DOM elements for pet listings
let profilePetListingsContainer;
let addListingBtn;
let listingModal;
let petForm;
let imagePreviewsContainer;
let closeModalBtn;

const API_BASE_URL = 'https://v2.api.noroff.dev';
const PETS_ENDPOINT = `${API_BASE_URL}/pets`;


/**
 * Initialize the profile page
 */
function init() {
  // Check authentication first
  const userData = getCurrentUser();
  if (!userData) {
    // Not logged in, redirect to login page
    window.location.href = '/account/login';
    return;
  }
  
  // Get DOM elements
  addListingBtn = document.getElementById('add-listing-btn');
  listingModal = document.getElementById('listing-modal');
  petForm = document.querySelector('.pet-form');
  closeModalBtn = document.getElementById('close-modal-btn');
  profilePetListingsContainer = document.getElementById('pet-listings');
  imagePreviewsContainer = document.getElementById('image-previews');
  
  // Verify required elements exist
  if (!profilePetListingsContainer) {
    console.error('Pet listings container not found');
    return;
  }
  
  if (!listingModal) {
    console.error('Listing modal not found');
    return;
  }
  
  // Add event listeners
  if (addListingBtn) {
    addListingBtn.addEventListener('click', openNewListingModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  // Set up the form listeners using imported handlers
  if (petForm) {
    petForm.addEventListener('submit', async event => {
      event.preventDefault();
  
      const name = document.getElementById('pet-name').value.trim();
      const breed = document.getElementById('pet-breed').value.trim();
      const age = document.getElementById('pet-age').value.trim();
      const size = document.getElementById('pet-size').value.trim();
      const description = document.getElementById('pet-description').value.trim();
      const imageUrl = document.getElementById('pet-image-url').value.trim();
  
      // Validate form data
      if (name === '' || breed === '' || age === '' || size === '' || description === '') {
        alert('Please fill out all required fields.');
        return;
      }

      const payload = {
        name,
        species: "Dog",
        breed,
        age: Number(age),
        gender: "Male",
        size,
        color: "Brown",
        description,
        location: "Oslo, Norway"
      };
  
      // Add image if URL is provided
      if (imageUrl && imageUrl.trim().length > 0) {
        payload.image = {
          url: imageUrl,
          alt: `${name} - ${breed}`
        };
      }

      console.log('Sending pet data:', payload);
  
      try {
        const response = await fetch('https://v2.api.noroff.dev/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
  
        console.log('Pet created response:', response);
        
        // Check if we have a successful response with data
        if (response && response.data) {
          const newPet = response.data;
          console.log('New pet created:', newPet);
          
          // Show success message
          alert('Pet created successfully!');
          
          // Add the new pet directly to the DOM
          const petListingsContainer = document.getElementById('pet-listings');
          
          // If this is the first pet, clear the "no pets" message
          if (petListingsContainer.querySelector('.text-center')) {
            petListingsContainer.innerHTML = '';
          }
          
          // Create and add the pet card
          const petCard = createPetCard(newPet);
          petListingsContainer.appendChild(petCard);
          
          // Reset form and close modal
          petForm.reset();
          closeModal();
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Failed to create pet:', error);
        alert('Failed to create pet: ' + error.message);
      }
    });
    
    // Set up the update pet form listener
    setUpdatePetFormListener(petForm, async (petId, petData) => {
      try {
        const result = await updatePet(petId, petData);
        console.log('Pet updated successfully:', result);
        alert('Pet updated successfully!');
        loadUserPets();
        closeModal();
      } catch (error) {
        console.error('Failed to update pet:', error);
        alert('Failed to update pet: ' + error.message);
      }
    });
  }
  
  // Setup delegated event handling for dynamic elements
  document.addEventListener('click', function(e) {
    if (e.target.closest('.edit-btn')) {
      const petId = e.target.closest('.edit-btn').getAttribute('data-id');
      setGetPetFormListener(petId, (pet) => {
        openEditListingModal(pet);
      }, (error) => {
        console.error('Error fetching pet for editing:', error);
      });
    }
    if (e.target.closest('.delete-btn')) {
      const petId = e.target.closest('.delete-btn').getAttribute('data-id');
      handlePetDelete(petId);
    }
    if (e.target.id === 'no-pets-add-btn') {
      openNewListingModal();
    }
  });
  
  // Set up the get all pets listener and load user's pets
  setGetAllPetsFormListener(async (query) => {
    try {
      const userData = getCurrentUser();
      if (userData && userData.id) {
        const petsData = await getPets({
          query: userData.id
        });
        renderUserPets(petsData.data || [], profilePetListingsContainer);
      } else {
        showEmptyPetsState();
      }
    } catch (error) {
      console.error('Error loading user pets:', error);
      showError('Failed to load your pet listings. Please try again later.');
    }
  });
  
  loadUserPets();
}

// Make sure to call init when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

/**
 * Populate the user profile with data
 * @param {Object} userData - User data from storage
 */
function populateUserProfile(userData) {
  if (profileName) {
    profileName.textContent = userData.name || userData.email;
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    // Call logout API if needed
    await logout();
    
    // Redirect to login page
    navigateTo('/account/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

/**
 * Load the current user's pets from the API
 */
async function loadUserPets() {
  // Use the pet-listings container from your HTML
  const petListingsContainer = document.getElementById('pet-listings');
  if (!petListingsContainer) return;
  
  // Show loading state
  petListingsContainer.innerHTML = '<div class="text-center py-12">Loading your pets...</div>';
  
  try {
    // Debug user data
    const userData = getCurrentUser();
    console.log('User data from getCurrentUser():', userData);
    
    // Check localStorage directly as a fallback
    const userFromStorage = localStorage.getItem('user');
    console.log('User data from localStorage:', userFromStorage);
    
    let user;
    if (userData) {
      user = userData;
    } else if (userFromStorage) {
      // Try to parse the user from localStorage
      try {
        user = JSON.parse(userFromStorage);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    if (!user || !user.id) {
      showEmptyPetsState();
      return;
    }
    
    // Use the imported handler to get all pets
    setGetAllPetsFormListener(async () => {
      const petsData = await getPets({
        query: user.id
      });
      renderUserPets(petsData.data || [], petListingsContainer);
    })();
    
  } catch (error) {
    console.error('Error loading user pets:', error);
    petListingsContainer.innerHTML = '<div class="text-center py-12 text-red-500">Failed to load your pet listings. Please try again later.</div>';
  }
}

/**
 * Show empty pets state when user has no pets
 */
function showEmptyPetsState() {
  const petListingsContainer = document.getElementById('pet-listings');
  if (!petListingsContainer) return;
  
  petListingsContainer.innerHTML = `
    <div class="text-center py-12">
      <p class="text-gray-500 text-lg">You don't have any pet listings yet</p>
      <button id="no-pets-add-btn" class="mt-4 px-4 py-2 bg-[#362550] text-white rounded hover:bg-[#423063] transition">
        Add Your First Pet
      </button>
    </div>
  `;
  
  // Add event listener to the "Add Your First Pet" button
  const noAddButton = document.getElementById('no-pets-add-btn');
  if (noAddButton) {
    noAddButton.addEventListener('click', openNewListingModal);
  }
}

/**
 * Render the user's pets to the profile page
 * @param {Array} pets - Array of pet objects
 * @param {HTMLElement} container - Container element for pets
 */
function renderUserPets(pets, container) {
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  if (!pets || pets.length === 0) {
    showEmptyPetsState();
    return;
  }
  
  // Add each pet to the container
  pets.forEach(pet => {
    const petCard = createPetCard(pet);
    container.appendChild(petCard);
  });
}

/**
 * Create a card element for a pet
 * @param {Object} pet - Pet data
 * @returns {HTMLElement} - Pet card element
 */
function createPetCard(pet) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-md shadow-md overflow-hidden';
  
  card.innerHTML = `
    <div class="p-4 flex justify-between items-center">
      <h3 class="text-gray-800 font-medium">${pet.name || 'Unnamed Pet'}</h3>
      <div class="flex space-x-2">
        <button data-id="${pet.id}" class="edit-btn text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button data-id="${pet.id}" class="delete-btn text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="bg-gray-100 h-48 flex items-center justify-center">
    ${pet.image && pet.image.url
      ? `<img src="${pet.image.url}" alt="${pet.image.alt || pet.name}" class="h-full w-full object-cover">` 
      : `<div class="w-32 h-32 border-2 border-gray-300 flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
         </div>`
    }
  </div>
    
    <div class="p-4 flex justify-center">
      <a href="/pets/${pet.id}" class="bg-[#B06A4E] text-white px-6 py-2 rounded-md hover:bg-[#9d5b42] transition">View</a>
    </div>
  `;
  
  // Add event listeners for the edit and delete buttons
  const editBtn = card.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const petId = editBtn.getAttribute('data-id');
      // Use the imported handler to get the pet data
      setGetPetFormListener(petId, (pet) => {
        openEditListingModal(pet);
      }, (error) => {
        console.error('Error fetching pet for editing:', error);
      });
    });
  }
  
  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const petId = deleteBtn.getAttribute('data-id');
      handlePetDelete(petId);
    });
  }
  
  return card;
}

/**
 * Handle delete pet action
 * @param {number} petId - Pet ID
 */
async function handlePetDelete(petId) {
  if (!window.confirm('Are you sure you want to delete this pet?')) return;
  
  try {
    await deletePet(petId);
    loadUserPets(); // Reload pets after deletion
  } catch (error) {
    showError('Failed to delete the pet. Please try again.');
  }
}

/**
 * Open the modal to add a new pet
 */
function openNewListingModal() {
  // Reset the form
  petForm.reset();
  document.getElementById('pet-id').value = '';
  
  // Clear image previews
  if (imagePreviewsContainer) {
    imagePreviewsContainer.innerHTML = '';
  }
  
  // Update modal title
  const modalTitle = document.querySelector('#listing-modal h2');
  if (modalTitle) {
    modalTitle.textContent = 'New Listing';
  }
  
  // Show the modal
  listingModal.classList.remove('hidden');
  listingModal.style.display = 'flex';
}

/**
 * Open the modal to edit an existing pet
 * @param {Object} pet - Pet data to edit
 */
function openEditListingModal(pet) {
  // Fill the form with pet data
  document.getElementById('pet-id').value = pet.id;
  document.getElementById('pet-name').value = pet.name || '';
  document.getElementById('pet-breed').value = pet.breed || '';
  document.getElementById('pet-age').value = pet.age || '';
  document.getElementById('pet-size').value = pet.size || '';
  document.getElementById('pet-description').value = pet.description || '';
  
  // Set image URL if available
  if (pet.media && pet.media.length > 0) {
    document.getElementById('pet-image-url').value = pet.media[0].url || '';
    
    // Preview the image
    if (imagePreviewsContainer) {
      imagePreviewsContainer.innerHTML = '';
      
      const preview = document.createElement('div');
      preview.className = 'relative border p-2';
      
      const img = document.createElement('img');
      img.src = pet.media[0].url;
      img.alt = pet.name;
      img.className = 'w-24 h-24 object-cover';
      
      preview.appendChild(img);
      imagePreviewsContainer.appendChild(preview);
    }
  } else {
    document.getElementById('pet-image-url').value = '';
    if (imagePreviewsContainer) {
      imagePreviewsContainer.innerHTML = '';
    }
  }
  
  // Update modal title
  const modalTitle = document.querySelector('#listing-modal h2');
  if (modalTitle) {
    modalTitle.textContent = 'Edit Listing';
  }
  
  // Show the modal
  listingModal.classList.remove('hidden');
  listingModal.style.display = 'flex';
}

/**
 * Close the modal
 */
function closeModal() {
  listingModal.classList.add('hidden');
  listingModal.style.display = 'none';
}

/**
 * Show a loading state
 */
function showLoadingState() {
  profilePetListingsContainer.innerHTML = '<div class="text-center py-12">Loading...</div>';
}

/**
 * Show an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  profilePetListingsContainer.innerHTML = `
    <div class="text-center py-12 text-red-500">${message}</div>
  `;
}

document.addEventListener('DOMContentLoaded', init);