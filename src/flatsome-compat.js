/**
 * Flatsome Theme Compatibility Script
 *
 * This module provides JavaScript utilities for integrating Polotno Studio
 * with the Flatsome theme, handling events, and ensuring proper functionality.
 */

/**
 * Initialize Flatsome compatibility
 */
export const initFlatsomeCompat = () => {
  // Wait for Flatsome to be ready
  if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(() => {
      setupFlatsomeIntegration();
    });
  } else {
    // Fallback if jQuery is not available
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupFlatsomeIntegration);
    } else {
      setupFlatsomeIntegration();
    }
  }
};

/**
 * Setup Flatsome-specific integrations
 */
const setupFlatsomeIntegration = () => {
  // Handle Flatsome quick view
  handleQuickView();

  // Handle Flatsome lightbox
  handleLightbox();

  // Handle Flatsome lazy loading
  handleLazyLoading();

  // Handle Flatsome cart updates
  handleCartUpdates();

  // Handle responsive sidebar
  handleResponsiveSidebar();

  // Handle fullscreen mode
  handleFullscreenMode();
};

/**
 * Handle Flatsome quick view modal
 */
const handleQuickView = () => {
  if (typeof jQuery === 'undefined') return;

  jQuery(document).on('mfpOpen', '.quick-view', function() {
    // Wait for quick view content to load
    setTimeout(() => {
      const quickViewContent = document.querySelector('.mfp-content');
      if (quickViewContent) {
        // Trigger resize event for Polotno canvas
        window.dispatchEvent(new Event('resize'));
      }
    }, 300);
  });
};

/**
 * Handle Flatsome lightbox integration
 */
const handleLightbox = () => {
  // Prevent lightbox from opening on design preview clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.polotno-app-container')) {
      const lightboxLink = e.target.closest('a[data-rel^="lightbox"]');
      if (lightboxLink && lightboxLink.closest('.cart-item-design-preview')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);
};

/**
 * Handle Flatsome lazy loading for design previews
 */
const handleLazyLoading = () => {
  // Disable lazy loading for Polotno canvas images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.classList?.contains('polotno-app-container')) {
          const lazyImages = node.querySelectorAll('img[data-src]');
          lazyImages.forEach((img) => {
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

/**
 * Handle WooCommerce cart updates in Flatsome
 */
const handleCartUpdates = () => {
  if (typeof jQuery === 'undefined') return;

  jQuery(document.body).on('updated_cart_totals updated_checkout', () => {
    // Refresh design previews in cart
    refreshCartDesignPreviews();
  });
};

/**
 * Refresh design previews in cart
 */
const refreshCartDesignPreviews = () => {
  const previews = document.querySelectorAll('.cart-item-design-preview');
  previews.forEach((preview) => {
    if (preview.dataset.designId) {
      // Force reload preview image
      const img = preview.querySelector('img');
      if (img) {
        img.src = img.src.split('?')[0] + '?t=' + Date.now();
      }
    }
  });
};

/**
 * Handle responsive sidebar collapse in mobile view
 */
const handleResponsiveSidebar = () => {
  const checkMobile = () => {
    if (window.innerWidth <= 849) {
      // Flatsome mobile breakpoint
      const sidePanel = document.querySelector('.polotno-side-panel');
      if (sidePanel) {
        sidePanel.classList.add('mobile-collapsed');
      }
    }
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);
};

/**
 * Handle fullscreen mode toggle
 */
const handleFullscreenMode = () => {
  window.togglePolotnoFullscreen = () => {
    const wrapper = document.querySelector('.flatsome-polotno-wrapper');
    if (wrapper) {
      wrapper.classList.toggle('fullscreen');

      // Trigger resize event for canvas
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);

      // Update body class for styling
      document.body.classList.toggle('polotno-fullscreen-active');
    }
  };
};

/**
 * Add design to cart with Flatsome AJAX
 */
export const addDesignToCartFlatsome = async (productId, designId, quantity = 1) => {
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is required for Flatsome cart integration');
    return;
  }

  const formData = new FormData();
  formData.append('action', 'polotno_add_to_cart');
  formData.append('product_id', productId);
  formData.append('design_id', designId);
  formData.append('quantity', quantity);

  try {
    const response = await fetch(window.polotnoStudio?.ajaxUrl || '/wp-admin/admin-ajax.php', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });

    const result = await response.json();

    if (result.success) {
      // Trigger Flatsome cart update
      jQuery(document.body).trigger('wc_fragment_refresh');

      // Show Flatsome cart notification
      if (typeof flatsomeVars !== 'undefined' && flatsomeVars.cart_url) {
        showFlatsomeNotification('Product added to cart!', 'success');
      }

      return result;
    } else {
      throw new Error(result.message || 'Failed to add to cart');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showFlatsomeNotification('Error adding to cart', 'error');
    throw error;
  }
};

/**
 * Show Flatsome-style notification
 */
const showFlatsomeNotification = (message, type = 'success') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `flatsome-notification flatsome-notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    z-index: 99999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
};

/**
 * Initialize product customizer button in Flatsome product page
 */
export const initProductCustomizerButton = (productId) => {
  const addToCartButton = document.querySelector('.single_add_to_cart_button');

  if (addToCartButton) {
    // Create customize button
    const customizeBtn = document.createElement('button');
    customizeBtn.type = 'button';
    customizeBtn.className = 'button alt polotno-customize-btn';
    customizeBtn.textContent = 'Customize Design';
    customizeBtn.style.marginLeft = '10px';

    customizeBtn.addEventListener('click', () => {
      const editorWrapper = document.querySelector('.flatsome-polotno-wrapper');
      if (editorWrapper) {
        editorWrapper.scrollIntoView({ behavior: 'smooth' });
      }
    });

    addToCartButton.parentNode.insertBefore(customizeBtn, addToCartButton.nextSibling);
  }
};

/**
 * Sync Flatsome color swatches with Polotno canvas
 */
export const syncFlatsomeVariations = (store) => {
  if (typeof jQuery === 'undefined') return;

  jQuery('.variations_form').on('woocommerce_variation_select_change', function() {
    const selectedColor = jQuery('.variation-selector .selected').data('value');
    if (selectedColor && store) {
      // Update canvas background or apply color to elements
      // This is a hook for custom implementation
      window.dispatchEvent(new CustomEvent('flatsome-variation-changed', {
        detail: { color: selectedColor, store }
      }));
    }
  });
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  initFlatsomeCompat();
}

export default {
  initFlatsomeCompat,
  addDesignToCartFlatsome,
  initProductCustomizerButton,
  syncFlatsomeVariations,
};
