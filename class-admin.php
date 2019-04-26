<?php


class Background_Image_Manager_Admin extends Background_Image_Manager {

	var $option_nonce = 'background_image_manager_nonce';
	var $option_nonce_action = 'background_image_manager_action';

	/**
	 *	Profile requirement metabox callback
	 */
	public function __construct() {

		add_action('init', array($this, 'init'));

		add_filter('background-image-manager-sources', array($this, 'filter_sources'), 10, 4);

	}

	/**
	 * @API
	 * @filter: 'background-image-manager-sources'
	 */
	public function filter_sources($sources, $img_id, $img_sizes = null, $type = 'image/jpeg') {

		return $this->get_image_source($img_id, $img_sizes, $type);

	}

	/**
	 *	Profile requirement metabox callback
	 */
	public function init() {

		add_action('admin_menu', array($this, 'admin_menu'));

		$this->save_settings();

	}

	/**
	 * Add Custom Option Page
	 *
	 * @hook admin_menu
	 */
	public function admin_menu() {


		add_submenu_page (
			'options-general.php',
			'Background Image Manager',
			'Background Image Manager',
			'manage_options',
			'background-image-manager',
			array($this, 'print_admin_page')
		);

	}

	/**
	 * @callback add_submenu_page
	 */
	public function print_admin_page() {

		include plugin_dir_path( __FILE__ ) . 'include/options.php';


	}


	/**
	 * Save custom settings
	 *
	 * @hook init
	 */
	public function save_settings() {

		if (isset($_POST[$this->option_nonce]) && wp_verify_nonce($_POST[$this->option_nonce], $this->option_nonce_action) && current_user_can('manage_options')) {

			if (isset($_POST['bim_method'])) {

				$this->update_option('method', $_POST['bim_method']);

			}

			if (isset($_POST['bim_source'])) {

				$this->update_option('source', $_POST['bim_source']);

			}

			$this->update_option('sizes', isset($_POST['bim_sizes']) ? $_POST['bim_sizes'] : array());

			$this->update_option('progressive', isset($_POST['bim_progressive']) ? 1 : 0);

			if (isset($_POST['_wp_http_referer'])) {

				wp_redirect($_POST['_wp_http_referer']);
				exit;

			}

		}

	}



}
