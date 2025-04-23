/**
 * Footer component
 * Handles functionality related to the site footer
 */

import { isAuthenticated } from '../api/auth.js';

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
    default:
      return;
  }
  
  
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

document.addEventListener('DOMContentLoaded', init);

export {
  init,
  updateAdminCTA
};