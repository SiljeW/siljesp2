/**
 * Footer component
 * Handles functionality related to the site footer
 */

import { isAuthenticated } from '../api/auth.mjs';

/**
 * Initialize the footer component
 */
function init() {
  updateAdminCTA();
  attachEventListeners();
}

/**
 * Update the admin call-to-action section based on auth state
 */
function updateAdminCTA() {
  const adminCTA = document.getElementById('admin-cta');
  
  if (!adminCTA) return;
  
  if (isAuthenticated()) {
    // User is already logged in, hide the CTA
    adminCTA.classList.add('hidden');
  } else {
    // User is not logged in, show the CTA
    adminCTA.classList.remove('hidden');
  }
}

/**
 * Attach event listeners to footer elements
 */
function attachEventListeners() {
  // Get current year for copyright
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  // Social media share buttons
  const shareButtons = document.querySelectorAll('[data-share]');
  shareButtons.forEach(button => {
    button.addEventListener('click', handleSocialShare);
  });
  
  // Newsletter signup (if it exists)
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSignup);
  }
  
  // Scroll to top button (if it exists)
  const scrollToTopButton = document.getElementById('scroll-to-top');
  if (scrollToTopButton) {
    scrollToTopButton.addEventListener('click', scrollToTop);
    
    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', toggleScrollToTopButton);
  }
}

/**
 * Handle social media sharing
 * @param {Event} event - Click event
 */
function handleSocialShare(event) {
  event.preventDefault();
  
  const platform = event.currentTarget.dataset.share;
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  
  let shareUrl;
  
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
    case 'instagram':
      // Instagram doesn't support direct URL sharing, so copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard! You can now paste it in your Instagram post.');
      });
      return;
    default:
      return;
  }
  
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

/**
 * Handle newsletter signup
 * @param {Event} event - Form submit event
 */
function handleNewsletterSignup(event) {
  event.preventDefault();
  
  const emailInput = event.target.querySelector('input[type="email"]');
  const email = emailInput?.value?.trim();
  
  if (!email) {
    alert('Please enter a valid email address.');
    return;
  }
  
  // Here you would typically send the email to your backend
  console.log('Newsletter signup:', email);
  
  // Show success message
  const successMessage = document.createElement('div');
  successMessage.className = 'text-green-600 text-sm mt-2';
  successMessage.textContent = 'Thank you for subscribing!';
  
  // Replace form with success message temporarily
  const form = event.target;
  const originalHTML = form.innerHTML;
  form.innerHTML = '';
  form.appendChild(successMessage);
  
  // Reset form after 3 seconds
  setTimeout(() => {
    form.innerHTML = originalHTML;
    // Re-attach event listener
    form.addEventListener('submit', handleNewsletterSignup);
  }, 3000);
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Toggle scroll to top button visibility based on scroll position
 */
function toggleScrollToTopButton() {
  const scrollToTopButton = document.getElementById('scroll-to-top');
  if (!scrollToTopButton) return;
  
  if (window.scrollY > 300) {
    scrollToTopButton.classList.remove('hidden');
    scrollToTopButton.classList.add('opacity-100');
  } else {
    scrollToTopButton.classList.add('hidden');
    scrollToTopButton.classList.remove('opacity-100');
  }
}

// Auto-initialize when this module is imported
console.log('Footer component loaded');

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

// Export functions for manual initialization if needed
export {
  init,
  updateAdminCTA
};