<?php

class Background_Image_Manager_Site extends Background_Image_Manager {

	var $option_nonce = 'background_image_manager_nonce';
	var $option_nonce_action = 'background_image_manager_action';

	var $default_method = 'object_fit';
	var $default_source = 'progressive';

	/**
	 *	Profile requirement metabox callback
	 */
	public function __construct() {

		$this->plugin_path = plugin_dir_path( __FILE__ );

		add_action('init', array($this, 'init'));

	}

	/**
	 *	Profile requirement metabox callback
	 */
	public function init() {

		add_action('wp_head', array($this, 'print_script'));
		add_filter('background-image', array($this, 'filter_background_image'), 10, 5);
		add_filter('background-image-iframe', array($this, 'filter_iframe'), 10, 3);

	}

	/**
	 *	Print theme styles and scripts
	 */
	public function scripts_styles() {

		wp_register_script('background-image-manager', plugin_dir_url( __FILE__ ) . 'js/load-manager.js', array(), $this->version, false);
		wp_localize_script('background-image-manager', 'bim_option', array(
			'display_method' => $this->get_option('method', $this->default_method),
			'loading_method' => $this->get_option('source', $this->default_source),
			'progressive' => $this->get_option('progressive', $this->default_progressive)
		));
		wp_enqueue_script('background-image-manager');

	}

	public function print_script() {

		include plugin_dir_path( __FILE__ ) . 'include/script.php';

	}

	public function filter_background_image($html, $image_id, $size = 'cover', $position = 'center', $args = array(), $sizes = null) {
		static $index = 0;

		if (!$sizes) {

			$sizes = $this->get_option('sizes');

		}

		$type = get_post_mime_type($image_id);

		$sources = $this->get_image_source($image_id, $sizes, $type);

		if (empty($sources)) {

			return $html;

		}

		$display_method = $this->get_option('method', $this->default_method);
		$loading_method = $this->get_option('source', $this->default_source);

		$attributes = array_merge($args, array(
			'id' => 'attachment-'.$image_id,
			'src' => $sources[0]['src'],
			'width' => $sources[0]['width'],
			'height' => $sources[0]['height'],
			//'srcset' => $this->get_srcset($sources)
			// sizes="(max-width: 800px) 100vw, 50vw"
			'title' => get_the_title($image_id),
			'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true)
		));

		ob_start();

		if ($type === 'image/jpeg' || $type === 'image/jpg' || $type === 'image/png') {

			if ($display_method === 'object_fit') {

				$attributes = array_merge($args, $attributes);

				if ($loading_method === 'auto-load') {

					$attributes['onload'] = "onBackgroundImageLoad(this, '$size', '$position')";

					$attributes['data-srcset'] = $this->get_srcset($sources);

				} else if ($loading_method === 'srcset') {

					$attributes['srcset'] = $this->get_srcset($sources);

				}

				$attributes['style'] = 'width:100%;height:100%;object-fit:'.$size.';object-position:'.$position.';';

				include plugin_dir_path( __FILE__ ) . 'include/image.php';

			} else if ($display_method === 'image') {

				$attributes = array_merge($args, $attributes);

				$attributes['onload'] = "onBackgroundImageLoad(this, '$size', '$position')";

				if ($size === 'cover' || $size === 'contain') {
					$attributes['style'] = 'position:absolute;';
				}

				if ($loading_method === 'srcset') {

					$attributes['srcset'] = $this->get_srcset($sources);

				} else if ($loading_method === 'auto-load') {

					$attributes['data-srcset'] = $this->get_srcset($sources);
					$attributes['style'] .= 'display:none;'; // -> prevent glitch

				}

				include plugin_dir_path( __FILE__ ) . 'include/image.php';

			} else if ($display_method === 'canvas') {

				$attributes['srcset'] = $this->get_srcset($sources);
				$canvas_attributes = $args;
				$canvas_attributes['id'] = 'background-canvas-'.$index.'-'.$image_id;
				$canvas_attributes['width'] = $sources[0]['width'];
				$canvas_attributes['height'] = $sources[0]['height'];

				include plugin_dir_path( __FILE__ ) . 'include/canvas.php';

			} else if ($display_method === 'background_image') {

				$attributes = $args;
				$attributes['id'] = 'background-'.$index.'-'.$image_id;
				$attributes['data-srcset'] = $this->get_srcset($sources);
				$attributes['style'] = 'width:100%;height:100%;background-image:url('.$sources[0]['src'].');background-size:'.$size.';background-position:'.$position.';background-repeat:no-repeat;';

				include plugin_dir_path( __FILE__ ) . 'include/background.php';

			}

		} else if (strpos($type, 'video') !== false) { // video

			$attributes['onLoadeddata'] = "onBackgroundVideo(this, '$size', '$position')";
			$attributes['style'] = 'position:absolute';

			include plugin_dir_path( __FILE__ ) . 'include/video.php';

		}

		$html = ob_get_contents();

		ob_end_clean();

		$index++;

		return $html;
	}


	/**
	 * get srcset
	 */
	public function get_srcset($sources) {

		$srcsets = array();

		foreach ($sources as $source) {

			$srcsets[] = $source['src'] . ' ' . $source['width'] . 'w';

		}

		return implode(', ', $srcsets);
	}


	public function is_ie() {

		$ua = htmlentities($_SERVER['HTTP_USER_AGENT'], ENT_QUOTES, 'UTF-8');

		if (strpos('MSIE', $ua) !== false || (strpos($ua, 'Trident') !== false)) {

			return true;

		}

		return false;
	}



	/**
	 *	Parse tag
	 */
	public function parse_tag($html) {

		$tag = array();
		$first_opening_brackets = strpos($html, '<');
		$first_closing_brackets = strpos($html, '>');
		$last_opening_brackets = strrpos($html, '<');
		$last_closing_brackets = strrpos($html, '>');

		$tag_data = substr($html, $first_opening_brackets + 1, $first_closing_brackets - $first_opening_brackets - 1);

		if (preg_match('/^\w+/', $tag_data, $matches)) {

			$tag['name'] = $matches[0];

			$tag_data = substr($tag_data, strlen($matches[0]));

		}

		$attributes = array();

		if (preg_match_all('/\w+="[^"]*"/', $tag_data, $matches)) {

			foreach ($matches[0] as $part) {

				$pair = explode('=', $part);
				$attributes[$pair[0]] = substr($pair[1], 1, -1);

			}

		}

		$tag['attributes'] = $attributes;

		$tag['content'] = substr($html, $first_closing_brackets + 1, $last_opening_brackets - $first_closing_brackets - 1);

		return $tag;

	}

	/**
	 * @filter 'background-image-iframe'
	 */
	public function filter_iframe($html, $size = 'cover', $position = 'center') {

    $doc = new DOMDocument();
    //$doc->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		$doc->loadHTML($html); // compat php5.2
    $tags = $doc->getElementsByTagName( 'iframe' );
    foreach ( $tags as $tag ) {
      // $iframe_src = $tag->attributes->getNamedItem('src')->value;
			// $url = add_query_arg( array(
			//
			// 	// https://developers.google.com/youtube/player_parameters
			// 	'autohide' => 1,
			// 	'autoplay' => 1,
			// 	'controls' => 0,
			// 	'feature' => null,
			// 	'modestbranding' => 1,
			// 	'playsinline' => 1,
			// 	'rel' => 0,
			// 	'showinfo' => 0,
			// 	'loop' => 1,
			// 	'mute' => 1,
			//
			// 	// https://developer.vimeo.com/player/embedding
      //   'badge' => 0,
      //   'byline' => 0,
      //   'portrait' => 0,
      //   'title' => 0,
			// ), $iframe_src );
      // $tag->setAttribute('src', $url);

			$tag->setAttribute('onload', "onBackgroundVideo(this, '$size', '$position')");
			$tag->setAttribute('style', "position:absolute");
      $html = $doc->saveHTML();
    }
    return $html;
	}


}
