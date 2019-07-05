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

	/**
	 * Get image sources
	 */
	public function get_image_source($img_id, $img_sizes = null, $type = 'image/jpeg') {
		static $baseurl;

		if (!isset($baseurl)) {

			$uploads = wp_get_upload_dir();
			$baseurl = $uploads['baseurl'] . '/';

		}

		$sources = array();
		$metadata = wp_get_attachment_metadata($img_id);
		$path = '';
		$file = get_post_meta($img_id, '_wp_attached_file', true);



		if ($type === 'image/jpeg' || $type === 'image/jpg' || $type === 'image/png') {

			if (!$img_sizes) {

				$img_sizes = $this->get_option('sizes', get_intermediate_image_sizes());

			}

			$basename = basename($file);
			$path = str_replace($basename, '', $file);

			foreach ($img_sizes as $img_size) {

				if (isset($metadata['sizes'][$img_size])) {

					$sources[] = array(
						'src' => $baseurl . $path . $metadata['sizes'][$img_size]['file'],
						'width' => $metadata['sizes'][$img_size]['width'],
						'height' => $metadata['sizes'][$img_size]['height']
					);

				}

			}

			if (!$sources) {

				$sources[] = array(
					'src' => $baseurl . $file,
					'width' => $metadata['width'],
					'height' => $metadata['height']
				);

			}


// 		full ->
//
// 			$sources[] = array(
// 				'src' => $metadata['file'],
// 				'width' => $metadata['width'],
// 				'height' => $metadata['height']
// 			);

		} else if (strpos($type, 'video') !== false) {

			$sources[] = array(
				'src' => $baseurl . $file,
				'width' => $metadata['width'],
				'height' => $metadata['height']
			);

		}

		return $sources;

	}

	/**
	 * @API
	 * @filter: 'background-image-manager-sources'
	 */
	public function filter_sources($sources, $img_id, $img_sizes = null, $type = 'image/jpeg') {

		return $this->get_image_source($img_id, $img_sizes, $type);

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
