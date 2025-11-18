# Polotno Studio - WordPress, WooCommerce & Flatsome Integration

A professional design editor built on Polotno SDK, fully integrated with WordPress, WooCommerce, and the Flatsome theme. This is a production-ready product customization solution.

## Features

- 🎨 **Full Design Editor** - Complete canvas-based design tool powered by Polotno SDK
- 🛒 **WooCommerce Integration** - Allow customers to customize products before purchasing
- 🎭 **Flatsome Theme Compatible** - Seamlessly integrates with Flatsome theme
- 👤 **WordPress Authentication** - Uses native WordPress user management
- 💾 **Cloud Storage** - Designs are saved to WordPress database
- 📱 **Responsive** - Works on desktop, tablet, and mobile devices
- 🌍 **Multi-language Support** - Supports English, French, Indonesian, Russian, Portuguese, and Chinese

## Requirements

- **WordPress**: 5.8 or higher
- **PHP**: 7.4 or higher
- **Node.js**: 16.x or higher (for development)
- **WooCommerce**: 5.0 or higher (optional, for e-commerce features)
- **Flatsome Theme**: Latest version (optional, for enhanced compatibility)

## Installation

### Method 1: WordPress Plugin (Recommended)

1. **Build the plugin**:
   ```bash
   npm install
   WORDPRESS_BUILD=true npm run build
   ```

2. **Install the plugin**:
   - Zip the `wordpress-plugin` directory
   - Upload to WordPress via Plugins → Add New → Upload Plugin
   - Activate the plugin

3. **Configure**:
   - Go to Settings → Polotno Studio
   - Enter your Polotno API key (get one from [polotno.com](https://polotno.com))
   - Enable WooCommerce integration (if using WooCommerce)
   - Enable Flatsome compatibility (if using Flatsome theme)

### Method 2: Standalone Deployment

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd polotno-studio
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your configuration:
   ```env
   VITE_POLOTNO_API_KEY=your_api_key_here
   VITE_WP_API_URL=/wp-json/polotno-studio/v1
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Deploy**:
   - Upload the `dist` directory to your web server
   - Configure your web server to serve `index.html`

## Development

### Local Development

1. **Start development server**:
   ```bash
   npm start
   ```
   This will start Vite dev server on `http://localhost:5173`

2. **With WordPress backend**:
   ```bash
   WORDPRESS_BUILD=true npm start
   ```
   Configure proxy in `vite.config.js` to point to your local WordPress installation.

### Building

- **Standard build**: `npm run build`
- **WordPress plugin build**: `WORDPRESS_BUILD=true npm run build`

## WordPress Integration

### Using Shortcodes

**Full Editor**:
```
[polotno_studio product_id="123" width="100%" height="600px"]
```

**Design Preview**:
```
[polotno_design id="abc123" width="100%"]
```

### Programmatic Usage

```javascript
// Access the Polotno store
const store = window.store;

// Access the project
const project = window.project;

// Configuration from WordPress
const config = window.polotnoStudio;
```

## WooCommerce Integration

### Making Products Customizable

1. Edit a product in WooCommerce
2. In Product Data → Advanced, enable "Polotno Customizable"
3. The design editor will appear on the product page
4. Customers can customize and add to cart

### Product Customization Flow

1. Customer opens a customizable product
2. Design editor loads with product template (if set)
3. Customer creates their design
4. Design is saved and added to cart with the product
5. Order includes design ID for production

### API Integration

```javascript
import {
  getProduct,
  saveDesignToProduct,
  addToCart
} from './woocommerce.js';

// Get product details
const product = await getProduct(123);

// Save design to product
const result = await saveDesignToProduct({
  productId: 123,
  storeJSON: store.toJSON(),
  preview: blob,
  name: 'My Design'
});

// Add to cart
await addToCart({
  productId: 123,
  designId: result.design_id,
  quantity: 1
});
```

## Flatsome Theme Integration

The design editor automatically integrates with Flatsome theme features:

- ✅ Flatsome quick view modal
- ✅ Flatsome lightbox compatibility
- ✅ Flatsome lazy loading
- ✅ Flatsome cart AJAX updates
- ✅ Flatsome color swatches
- ✅ Responsive breakpoints

### Custom Integration

```javascript
import {
  initFlatsomeCompat,
  addDesignToCartFlatsome,
  syncFlatsomeVariations
} from './flatsome-compat.js';

// Initialize Flatsome integration
initFlatsomeCompat();

// Add design to cart with Flatsome AJAX
await addDesignToCartFlatsome(productId, designId, quantity);

// Sync color variations with canvas
syncFlatsomeVariations(store);
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_POLOTNO_API_KEY` | Polotno SDK API key | Required |
| `VITE_WP_API_URL` | WordPress REST API base URL | `/wp-json/polotno-studio/v1` |
| `VITE_SENTRY_DNS` | Sentry error tracking DSN | Optional |
| `VITE_PLAUSIBLE_DOMAIN` | Plausible analytics domain | Optional |

### WordPress Configuration

The plugin injects configuration via `window.polotnoStudio`:

```javascript
{
  apiKey: 'your-api-key',
  nonce: 'wp-rest-nonce',
  ajaxUrl: '/wp-admin/admin-ajax.php',
  restUrl: '/wp-json/polotno-studio/v1',
  currentUser: { id, username, displayName, email, roles },
  loginUrl: '/wp-login.php',
  logoutUrl: '/wp-login.php?action=logout',
  isWooCommerceActive: true,
  isFlatsomeActive: true
}
```

## API Reference

### Design Management

```javascript
import * as api from './api.js';

// List all designs
const designs = await api.listDesigns();

// Load design by ID
const { storeJSON, name } = await api.loadById({ id: 'abc123' });

// Save design
const result = await api.saveDesign({
  storeJSON: store.toJSON(),
  preview: blob,
  name: 'My Design',
  id: 'abc123' // optional
});

// Delete design
await api.deleteDesign({ id: 'abc123' });
```

### Asset Management

```javascript
// Upload asset
const asset = await api.uploadAsset({
  file: fileBlob,
  preview: previewBlob,
  type: 'image'
});

// List assets
const assets = await api.listAssets();

// Delete asset
await api.deleteAsset({ id: 'asset123' });
```

## Deployment

### Production Checklist

- [ ] Set `VITE_POLOTNO_API_KEY` in environment
- [ ] Configure WordPress REST API URL
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Test on target WordPress/WooCommerce version
- [ ] Test Flatsome compatibility
- [ ] Verify mobile responsiveness
- [ ] Test user authentication flow
- [ ] Test design save/load functionality
- [ ] Test WooCommerce cart integration

## Troubleshooting

### Editor not loading

1. Check browser console for errors
2. Verify Polotno API key is set correctly
3. Check WordPress REST API is accessible
4. Verify nonce is valid (check `window.polotnoStudio.nonce`)

### Designs not saving

1. Check user is logged in
2. Verify database table exists (`wp_polotno_designs`)
3. Check WordPress user has proper permissions
4. Check browser console for API errors

## Support

For issues and feature requests, please use the GitHub issue tracker.

## License

This project is licensed under the GPL v2 or later.

## Credits

- Built with [Polotno SDK](https://polotno.com)
- UI components from [Blueprint.js](https://blueprintjs.com)
- Icons from [@meronex/icons](https://github.com/meronex/meronex-icons)

## Changelog

### Version 1.0.0
- Initial production release
- WordPress integration
- WooCommerce support
- Flatsome theme compatibility
- Removed all demo components
- Production-ready REST API
- User authentication
- Design management system
