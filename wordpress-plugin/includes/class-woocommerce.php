<?php
/**
 * WooCommerce Integration for Polotno Studio
 *
 * @package Polotno_Studio
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * WooCommerce Integration Class
 */
class Polotno_Studio_WooCommerce {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        if (!class_exists('WooCommerce')) {
            return;
        }

        add_action('woocommerce_before_add_to_cart_button', array($this, 'add_customizer_button'));
        add_filter('woocommerce_add_cart_item_data', array($this, 'add_design_to_cart_item'), 10, 2);
        add_filter('woocommerce_get_item_data', array($this, 'display_design_in_cart'), 10, 2);
        add_action('woocommerce_add_order_item_meta', array($this, 'add_design_to_order_item'), 10, 2);
    }

    /**
     * Add customizer button to product page
     */
    public function add_customizer_button() {
        global $product;

        if (!$this->is_customizable_product($product)) {
            return;
        }

        echo '<div class="flatsome-polotno-wrapper" id="polotno-editor-' . esc_attr($product->get_id()) . '" data-product-id="' . esc_attr($product->get_id()) . '">';
        echo '<div id="root"></div>';
        echo '</div>';
    }

    /**
     * Check if product is customizable
     */
    private function is_customizable_product($product) {
        return get_post_meta($product->get_id(), '_polotno_customizable', true) === 'yes';
    }

    /**
     * Add design data to cart item
     */
    public function add_design_to_cart_item($cart_item_data, $product_id) {
        if (isset($_POST['polotno_design_id'])) {
            $cart_item_data['polotno_design_id'] = sanitize_text_field($_POST['polotno_design_id']);
        }
        return $cart_item_data;
    }

    /**
     * Display design in cart
     */
    public function display_design_in_cart($item_data, $cart_item) {
        if (isset($cart_item['polotno_design_id'])) {
            $item_data[] = array(
                'name' => __('Custom Design', 'polotno-studio'),
                'value' => sprintf(__('Design ID: %s', 'polotno-studio'), $cart_item['polotno_design_id']),
            );
        }
        return $item_data;
    }

    /**
     * Add design to order item meta
     */
    public function add_design_to_order_item($item_id, $cart_item) {
        if (isset($cart_item['polotno_design_id'])) {
            wc_add_order_item_meta($item_id, '_polotno_design_id', $cart_item['polotno_design_id']);
        }
    }
}
