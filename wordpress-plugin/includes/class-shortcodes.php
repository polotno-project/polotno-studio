<?php
/**
 * Shortcodes for Polotno Studio
 *
 * @package Polotno_Studio
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcodes Class
 */
class Polotno_Studio_Shortcodes {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('polotno_studio', array($this, 'render_editor'));
        add_shortcode('polotno_design', array($this, 'render_design'));
    }

    /**
     * Render editor shortcode
     * Usage: [polotno_studio product_id="123"]
     */
    public function render_editor($atts) {
        $atts = shortcode_atts(array(
            'product_id' => '',
            'design_id' => '',
            'width' => '100%',
            'height' => '600px',
        ), $atts);

        ob_start();
        ?>
        <div class="flatsome-polotno-wrapper" style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>;"
             data-product-id="<?php echo esc_attr($atts['product_id']); ?>"
             data-design-id="<?php echo esc_attr($atts['design_id']); ?>">
            <div id="root"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render design preview shortcode
     * Usage: [polotno_design id="abc123"]
     */
    public function render_design($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'width' => '100%',
        ), $atts);

        if (empty($atts['id'])) {
            return '';
        }

        global $wpdb;
        $design = $wpdb->get_row($wpdb->prepare(
            "SELECT preview_url FROM {$wpdb->prefix}polotno_designs WHERE design_id = %s",
            $atts['id']
        ));

        if (!$design || empty($design->preview_url)) {
            return '';
        }

        return sprintf(
            '<img src="%s" alt="%s" style="max-width: %s; height: auto;" class="polotno-design-preview" />',
            esc_url($design->preview_url),
            esc_attr__('Design Preview', 'polotno-studio'),
            esc_attr($atts['width'])
        );
    }
}
