<?php
/**
 * Gutenberg Block for Polotno Studio
 *
 * @package Polotno_Studio
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Gutenberg Block Class
 */
class Polotno_Studio_Gutenberg {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'register_block'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
    }

    /**
     * Register Gutenberg block
     */
    public function register_block() {
        if (!function_exists('register_block_type')) {
            return;
        }

        register_block_type('polotno-studio/editor', array(
            'editor_script' => 'polotno-studio-block-editor',
            'editor_style' => 'polotno-studio-block-editor',
            'render_callback' => array($this, 'render_block'),
            'attributes' => array(
                'productId' => array(
                    'type' => 'string',
                    'default' => '',
                ),
                'designId' => array(
                    'type' => 'string',
                    'default' => '',
                ),
                'width' => array(
                    'type' => 'string',
                    'default' => '100%',
                ),
                'height' => array(
                    'type' => 'string',
                    'default' => '600px',
                ),
            ),
        ));
    }

    /**
     * Enqueue block editor assets
     */
    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'polotno-studio-block-editor',
            POLOTNO_STUDIO_PLUGIN_URL . 'assets/gutenberg-block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
            POLOTNO_STUDIO_VERSION,
            true
        );

        wp_enqueue_style(
            'polotno-studio-block-editor',
            POLOTNO_STUDIO_PLUGIN_URL . 'assets/gutenberg-block.css',
            array('wp-edit-blocks'),
            POLOTNO_STUDIO_VERSION
        );
    }

    /**
     * Render block on frontend
     */
    public function render_block($attributes) {
        $product_id = isset($attributes['productId']) ? esc_attr($attributes['productId']) : '';
        $design_id = isset($attributes['designId']) ? esc_attr($attributes['designId']) : '';
        $width = isset($attributes['width']) ? esc_attr($attributes['width']) : '100%';
        $height = isset($attributes['height']) ? esc_attr($attributes['height']) : '600px';

        ob_start();
        ?>
        <div class="flatsome-polotno-wrapper"
             style="width: <?php echo $width; ?>; height: <?php echo $height; ?>;"
             data-product-id="<?php echo $product_id; ?>"
             data-design-id="<?php echo $design_id; ?>">
            <div id="root"></div>
        </div>
        <?php
        return ob_get_clean();
    }
}
