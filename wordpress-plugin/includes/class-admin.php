<?php
/**
 * Admin Panel for Polotno Studio
 *
 * @package Polotno_Studio
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin Class
 */
class Polotno_Studio_Admin {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Polotno Studio Settings', 'polotno-studio'),
            __('Polotno Studio', 'polotno-studio'),
            'manage_options',
            'polotno-studio',
            array($this, 'settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('polotno_studio_settings', 'polotno_api_key');
        register_setting('polotno_studio_settings', 'polotno_enable_woocommerce');
        register_setting('polotno_studio_settings', 'polotno_enable_flatsome');
    }

    /**
     * Settings page
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('Polotno Studio Settings', 'polotno-studio'); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields('polotno_studio_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php echo esc_html__('Polotno API Key', 'polotno-studio'); ?></th>
                        <td>
                            <input type="text" name="polotno_api_key" value="<?php echo esc_attr(get_option('polotno_api_key')); ?>" class="regular-text" />
                            <p class="description"><?php echo esc_html__('Get your API key from polotno.com', 'polotno-studio'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Enable WooCommerce Integration', 'polotno-studio'); ?></th>
                        <td>
                            <input type="checkbox" name="polotno_enable_woocommerce" value="1" <?php checked(get_option('polotno_enable_woocommerce'), '1'); ?> />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Enable Flatsome Compatibility', 'polotno-studio'); ?></th>
                        <td>
                            <input type="checkbox" name="polotno_enable_flatsome" value="1" <?php checked(get_option('polotno_enable_flatsome'), '1'); ?> />
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
