<?php
/*
Plugin Name: Background Image Manager
Plugin URI: http://maximeschoeni.ch
Description: Manage Background images
Version: 1.0
Author: Maxime Schoeni
Author URI: http://maximeschoeni.ch
Text Domain: background-image-manager
Domain Path: /lang/
*/

/*
Copyright 2019  Maxime Schoeni  (email: maxime4@gmail.com)
*/


class Background_Image_Manager {

	var $option_name = 'background-image-manager';
	var $version = '01';

	var $default_method = 'object_fit';
	var $default_source = 'auto-load';
	var $default_progressive = true;

	/**
	 *	get option
	 */
	public function get_option($name, $fallback = false) {

		if (!isset($this->options)) {

			$this->options = get_option($this->option_name);

		}

		if (isset($this->options[$name])) {

			return $this->options[$name];

		}

		return $fallback;
	}

	/**
	 *	get options
	 */
	public function get_options() {

		if (!isset($this->options)) {

			$this->options = get_option($this->option_name);

		}

		return $this->options;
	}

	/**
	 * Update option
	 */
	public function update_option($name, $value) {

		$this->options = $this->get_options();

		$this->options[$name] = $value;

		update_option($this->option_name, $this->options);

	}


	/**
	 * Cache images
	 */
	public function cache_images($ids) {
		global $wpdb;

		$attachments = $wpdb->get_results(
			"SELECT $wpdb->posts.* FROM $wpdb->posts WHERE ID IN (".implode( ",", $ids).")"
		);

		update_post_caches($attachments, 'any', false, true);

	}

}




global $background_image_manager;

if (is_admin()) {

	require plugin_dir_path( __FILE__ ) . 'class-admin.php';
	$background_image_manager = new Background_Image_Manager_Admin();

} else {

	require plugin_dir_path( __FILE__ ) . 'class-site.php';
	$background_image_manager = new Background_Image_Manager_Site();

}
