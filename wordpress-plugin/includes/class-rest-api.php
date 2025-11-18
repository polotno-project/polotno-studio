<?php
/**
 * REST API Handler for Polotno Studio
 *
 * @package Polotno_Studio
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API Class
 */
class Polotno_Studio_REST_API {

    /**
     * Instance
     */
    private static $instance = null;

    /**
     * Namespace for REST API
     */
    private $namespace = 'polotno-studio/v1';

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
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Design management routes
        register_rest_route($this->namespace, '/designs', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_designs'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        register_rest_route($this->namespace, '/designs/(?P<id>[\w-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_design'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        register_rest_route($this->namespace, '/designs', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_design'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        register_rest_route($this->namespace, '/designs/(?P<id>[\w-]+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_design'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        // File management routes
        register_rest_route($this->namespace, '/files', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_file'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        register_rest_route($this->namespace, '/files', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_file'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        // Key-value storage routes
        register_rest_route($this->namespace, '/kv/(?P<key>[\w-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_kv'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        register_rest_route($this->namespace, '/kv/(?P<key>[\w-]+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'set_kv'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        // Asset management routes
        register_rest_route($this->namespace, '/assets', array(
            'methods' => 'GET',
            'callback' => array($this, 'list_assets'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));

        register_rest_route($this->namespace, '/assets/(?P<id>[\w-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_asset'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
    }

    /**
     * Check if user has permission
     */
    public function check_user_permission() {
        return is_user_logged_in();
    }

    /**
     * Get user designs
     */
    public function get_designs($request) {
        global $wpdb;
        $user_id = get_current_user_id();

        $designs = $wpdb->get_results($wpdb->prepare(
            "SELECT design_id, design_name FROM {$wpdb->prefix}polotno_designs WHERE user_id = %d ORDER BY updated_at DESC",
            $user_id
        ));

        return rest_ensure_response(array(
            'data' => array_map(function($design) {
                return array(
                    'id' => $design->design_id,
                    'name' => $design->design_name,
                );
            }, $designs)
        ));
    }

    /**
     * Get single design
     */
    public function get_design($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $design_id = $request->get_param('id');

        $design = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}polotno_designs WHERE user_id = %d AND design_id = %s",
            $user_id,
            $design_id
        ));

        if (!$design) {
            return new WP_Error('not_found', 'Design not found', array('status' => 404));
        }

        return rest_ensure_response(array(
            'data' => json_decode($design->design_data, true)
        ));
    }

    /**
     * Save design
     */
    public function save_design($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $design_id = $request->get_param('design_id') ?: wp_generate_uuid4();
        $design_name = $request->get_param('design_name') ?: 'Untitled Design';
        $design_data = $request->get_param('design_data');

        // Handle file upload for preview
        $preview_url = '';
        if (!empty($_FILES['preview'])) {
            $upload = wp_handle_upload($_FILES['preview'], array('test_form' => false));
            if (isset($upload['url'])) {
                $preview_url = $upload['url'];
            }
        }

        $wpdb->replace(
            $wpdb->prefix . 'polotno_designs',
            array(
                'user_id' => $user_id,
                'design_id' => $design_id,
                'design_name' => $design_name,
                'design_data' => $design_data,
                'preview_url' => $preview_url,
            ),
            array('%d', '%s', '%s', '%s', '%s')
        );

        return rest_ensure_response(array(
            'id' => $design_id,
            'status' => 'saved'
        ));
    }

    /**
     * Delete design
     */
    public function delete_design($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $design_id = $request->get_param('id');

        $wpdb->delete(
            $wpdb->prefix . 'polotno_designs',
            array(
                'user_id' => $user_id,
                'design_id' => $design_id
            ),
            array('%d', '%s')
        );

        return rest_ensure_response(array('success' => true));
    }

    /**
     * Upload file
     */
    public function upload_file($request) {
        if (empty($_FILES['file'])) {
            return new WP_Error('no_file', 'No file provided', array('status' => 400));
        }

        $upload = wp_handle_upload($_FILES['file'], array('test_form' => false));

        if (isset($upload['error'])) {
            return new WP_Error('upload_error', $upload['error'], array('status' => 500));
        }

        return rest_ensure_response(array(
            'url' => $upload['url'],
            'file' => $upload['file']
        ));
    }

    /**
     * Get file
     */
    public function get_file($request) {
        $path = $request->get_param('path');
        $upload_dir = wp_upload_dir();
        $file_path = $upload_dir['basedir'] . '/' . $path;

        if (!file_exists($file_path)) {
            return new WP_Error('not_found', 'File not found', array('status' => 404));
        }

        return rest_ensure_response(array(
            'data' => base64_encode(file_get_contents($file_path))
        ));
    }

    /**
     * Get key-value data
     */
    public function get_kv($request) {
        $user_id = get_current_user_id();
        $key = $request->get_param('key');
        $option_key = "polotno_kv_{$user_id}_{$key}";

        $value = get_option($option_key, null);

        return rest_ensure_response(array(
            'data' => $value ? json_decode($value, true) : null
        ));
    }

    /**
     * Set key-value data
     */
    public function set_kv($request) {
        $user_id = get_current_user_id();
        $key = $request->get_param('key');
        $value = $request->get_param('value');
        $option_key = "polotno_kv_{$user_id}_{$key}";

        update_option($option_key, json_encode($value));

        return rest_ensure_response(array('success' => true));
    }

    /**
     * List assets
     */
    public function list_assets($request) {
        $user_id = get_current_user_id();
        $option_key = "polotno_kv_{$user_id}_assets-list";

        $assets = get_option($option_key, '[]');

        return rest_ensure_response(json_decode($assets, true));
    }

    /**
     * Get asset
     */
    public function get_asset($request) {
        $asset_id = $request->get_param('id');
        $upload_dir = wp_upload_dir();
        $asset_path = $upload_dir['basedir'] . '/polotno-assets/' . $asset_id;

        if (!file_exists($asset_path)) {
            return new WP_Error('not_found', 'Asset not found', array('status' => 404));
        }

        $asset_url = $upload_dir['baseurl'] . '/polotno-assets/' . $asset_id;

        return rest_ensure_response(array(
            'url' => $asset_url
        ));
    }
}
