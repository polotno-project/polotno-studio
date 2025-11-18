<?php
/**
 * Plugin Name: Polotno Studio - Design Editor
 * Plugin URI: https://github.com/your-repo/polotno-studio
 * Description: Professional design editor for WordPress with WooCommerce and Flatsome theme integration. Create custom designs for products.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: polotno-studio
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('POLOTNO_STUDIO_VERSION', '1.0.0');
define('POLOTNO_STUDIO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('POLOTNO_STUDIO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('POLOTNO_STUDIO_ASSETS_URL', POLOTNO_STUDIO_PLUGIN_URL . 'assets/dist/');

/**
 * Main Polotno Studio Plugin Class
 */
class Polotno_Studio {

    /**
     * Instance of this class
     * @var Polotno_Studio
     */
    private static $instance = null;

    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Load plugin dependencies
     */
    private function load_dependencies() {
        require_once POLOTNO_STUDIO_PLUGIN_DIR . 'includes/class-rest-api.php';
        require_once POLOTNO_STUDIO_PLUGIN_DIR . 'includes/class-woocommerce.php';
        require_once POLOTNO_STUDIO_PLUGIN_DIR . 'includes/class-admin.php';
        require_once POLOTNO_STUDIO_PLUGIN_DIR . 'includes/class-shortcodes.php';
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('init', array($this, 'load_textdomain'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));

        // Initialize components
        Polotno_Studio_REST_API::get_instance();
        Polotno_Studio_WooCommerce::get_instance();
        Polotno_Studio_Admin::get_instance();
        Polotno_Studio_Shortcodes::get_instance();
    }

    /**
     * Load plugin textdomain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'polotno-studio',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_assets() {
        // Main editor script
        wp_enqueue_script(
            'polotno-studio',
            POLOTNO_STUDIO_ASSETS_URL . 'polotno-studio.js',
            array(),
            POLOTNO_STUDIO_VERSION,
            true
        );

        // Main editor styles
        wp_enqueue_style(
            'polotno-studio',
            POLOTNO_STUDIO_ASSETS_URL . 'assets/index.css',
            array(),
            POLOTNO_STUDIO_VERSION
        );

        // Localize script with configuration
        wp_localize_script('polotno-studio', 'polotnoStudio', array(
            'apiKey' => get_option('polotno_api_key', ''),
            'nonce' => wp_create_nonce('wp_rest'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('polotno-studio/v1'),
            'currentUser' => $this->get_current_user_data(),
            'loginUrl' => wp_login_url(),
            'logoutUrl' => wp_logout_url(),
            'isWooCommerceActive' => class_exists('WooCommerce'),
            'isFlatsomeActive' => defined('FLATSOME_VERSION'),
        ));
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        // Only load on plugin settings page
        if ('settings_page_polotno-studio' !== $hook) {
            return;
        }

        wp_enqueue_style(
            'polotno-studio-admin',
            POLOTNO_STUDIO_PLUGIN_URL . 'assets/admin.css',
            array(),
            POLOTNO_STUDIO_VERSION
        );
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        // Routes are registered in REST API class
    }

    /**
     * Get current user data for JavaScript
     */
    private function get_current_user_data() {
        if (!is_user_logged_in()) {
            return null;
        }

        $current_user = wp_get_current_user();
        return array(
            'id' => $current_user->ID,
            'username' => $current_user->user_login,
            'displayName' => $current_user->display_name,
            'email' => $current_user->user_email,
            'roles' => $current_user->roles,
        );
    }
}

/**
 * Initialize the plugin
 */
function polotno_studio_init() {
    return Polotno_Studio::get_instance();
}

// Start the plugin
polotno_studio_init();

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    // Create necessary database tables
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}polotno_designs (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        design_id varchar(255) NOT NULL,
        design_name varchar(255) NOT NULL,
        design_data longtext NOT NULL,
        preview_url varchar(255),
        product_id bigint(20),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY design_id (design_id),
        KEY product_id (product_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);

    // Set default options
    add_option('polotno_api_key', '');
    add_option('polotno_enable_woocommerce', '1');
    add_option('polotno_enable_flatsome', '1');
});

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    // Cleanup if necessary
});
