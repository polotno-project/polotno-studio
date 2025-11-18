/**
 * WooCommerce Product Integration Module
 *
 * This module handles the integration between Polotno Studio and WooCommerce products.
 * It allows users to create custom designs for products and save them as product variations.
 */

// Get WooCommerce API base URL
const WC_API_BASE = import.meta.env.VITE_WP_API_URL || '/wp-json/polotno-studio/v1';

// Helper to get WordPress nonce for authenticated requests
const getWPNonce = () => {
  return window.polotnoStudio?.nonce || '';
};

// Helper to make authenticated API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${WC_API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': getWPNonce(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

/**
 * Get product details from WooCommerce
 * @param {number} productId - WooCommerce product ID
 * @returns {Promise<Object>} Product details
 */
export const getProduct = async (productId) => {
  return await apiRequest(`/products/${productId}`);
};

/**
 * Get list of customizable products
 * @returns {Promise<Array>} List of products that support customization
 */
export const getCustomizableProducts = async () => {
  return await apiRequest('/products?customizable=true');
};

/**
 * Save design to WooCommerce product
 * @param {Object} params - Save parameters
 * @param {number} params.productId - WooCommerce product ID
 * @param {Object} params.storeJSON - Polotno store JSON
 * @param {Blob} params.preview - Preview image blob
 * @param {string} params.name - Design name
 * @returns {Promise<Object>} Saved design details
 */
export const saveDesignToProduct = async ({ productId, storeJSON, preview, name }) => {
  const formData = new FormData();
  formData.append('product_id', productId);
  formData.append('design_data', JSON.stringify(storeJSON));
  formData.append('design_name', name);
  formData.append('preview', preview, 'preview.jpg');

  return await apiRequest('/products/save-design', {
    method: 'POST',
    body: formData,
    headers: {
      'X-WP-Nonce': getWPNonce(),
    },
  });
};

/**
 * Add customized product to cart
 * @param {Object} params - Cart parameters
 * @param {number} params.productId - WooCommerce product ID
 * @param {string} params.designId - Design ID
 * @param {number} params.quantity - Quantity to add
 * @param {Object} params.variation - Product variation data (optional)
 * @returns {Promise<Object>} Cart response
 */
export const addToCart = async ({ productId, designId, quantity = 1, variation = {} }) => {
  return await apiRequest('/cart/add', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      design_id: designId,
      quantity,
      variation,
    }),
  });
};

/**
 * Get design from product
 * @param {number} productId - WooCommerce product ID
 * @param {string} designId - Design ID
 * @returns {Promise<Object>} Design data
 */
export const getProductDesign = async (productId, designId) => {
  return await apiRequest(`/products/${productId}/designs/${designId}`);
};

/**
 * Update product design
 * @param {Object} params - Update parameters
 * @param {number} params.productId - WooCommerce product ID
 * @param {string} params.designId - Design ID
 * @param {Object} params.storeJSON - Updated Polotno store JSON
 * @param {Blob} params.preview - Updated preview image blob
 * @returns {Promise<Object>} Updated design details
 */
export const updateProductDesign = async ({ productId, designId, storeJSON, preview }) => {
  const formData = new FormData();
  formData.append('design_data', JSON.stringify(storeJSON));
  if (preview) {
    formData.append('preview', preview, 'preview.jpg');
  }

  return await apiRequest(`/products/${productId}/designs/${designId}`, {
    method: 'PUT',
    body: formData,
    headers: {
      'X-WP-Nonce': getWPNonce(),
    },
  });
};

/**
 * Delete product design
 * @param {number} productId - WooCommerce product ID
 * @param {string} designId - Design ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteProductDesign = async (productId, designId) => {
  return await apiRequest(`/products/${productId}/designs/${designId}`, {
    method: 'DELETE',
  });
};

/**
 * Get product templates
 * @param {number} productId - WooCommerce product ID
 * @returns {Promise<Array>} List of templates for the product
 */
export const getProductTemplates = async (productId) => {
  return await apiRequest(`/products/${productId}/templates`);
};

/**
 * Export design for production
 * @param {Object} params - Export parameters
 * @param {string} params.designId - Design ID
 * @param {string} params.format - Export format (pdf, png, svg, etc.)
 * @param {Object} params.options - Export options
 * @returns {Promise<Blob>} Exported file blob
 */
export const exportDesignForProduction = async ({ designId, format, options = {} }) => {
  const response = await fetch(`${WC_API_BASE}/export/${designId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': getWPNonce(),
    },
    body: JSON.stringify({ format, options }),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return await response.blob();
};

/**
 * Get order designs (for viewing customer orders in admin)
 * @param {number} orderId - WooCommerce order ID
 * @returns {Promise<Array>} List of designs in the order
 */
export const getOrderDesigns = async (orderId) => {
  return await apiRequest(`/orders/${orderId}/designs`);
};

/**
 * Initialize WooCommerce integration
 * Checks if running in WooCommerce context and sets up product association
 */
export const initWooCommerceIntegration = () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product_id');
  const designId = params.get('design_id');

  return {
    productId: productId ? parseInt(productId) : null,
    designId: designId || null,
    isWooCommerceContext: !!(productId || window.polotnoStudio?.productId),
  };
};

export default {
  getProduct,
  getCustomizableProducts,
  saveDesignToProduct,
  addToCart,
  getProductDesign,
  updateProductDesign,
  deleteProductDesign,
  getProductTemplates,
  exportDesignForProduction,
  getOrderDesigns,
  initWooCommerceIntegration,
};
