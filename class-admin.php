<?php


class Background_Image_Manager_Admin extends Background_Image_Manager {
	
	var $option_nonce = 'background_image_manager_nonce';
	var $option_nonce_action = 'background_image_manager_action';
	
	/**
	 *	Profile requirement metabox callback
	 */
	public function __construct() {
	
		add_action('init', array($this, 'init'));
		
		//add_action('background-image', array($this, 'filter_background_image'), 10, 2);
		
	}
	
	/**
	 *	Profile requirement metabox callback
	 */
	public function init() {
		
		add_action('admin_menu', array($this, 'admin_menu'));
		
		
		$this->save_settings();
		
		// print metaboxes
// 		add_action('add_meta_boxes', array($this, 'add_meta_boxes'), 10, 2);
// 		
// 		// save metaboxes
// 		add_action('save_post', array($this, 'save_post'), 10, 2); 
// 		
// 		// enqueue js
// 		add_action( 'admin_enqueue_scripts', array($this, 'js') );
// 		
// 		// print item outside metabox
// 		add_action('post_gallery_box_print', array($this, 'print_item_by_id'), 10, 2);
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
	
	
	
	// 
// 	
// 	
// 	
// 	
// 	
// 	
// 	
// 	
// 	
// 	
// 	
// 	
// 	/**
// 	 *	Profile requirement metabox callback
// 	 */
// 	public function register($args) {
// 		
// 		$args = wp_parse_args($args, array(
// 			'id' => 'post-gallery-' . count($this->items),
// 			'title' => __('Gallery', 'post-gallery-box'),
// 			'post_types' => array('post', 'page'),
// 			'context' => 'side',
// 			'metabox' => true,
// 			'priority' => 'default',
// 			'media_types' => array('image'), // ,video, application
// 			'button_name' => __('Add images', 'post-gallery-box')
// 		));
// 		
// 		if (!is_array($args['post_types'])) $args['post_types'] = array($args['post_types']);
// 		
// 		$this->items[] = $args;
// 		
// 	}
// 	
// 	/**
// 	 * Add meta boxes.
// 	 *
// 	 * Hook for 'add_meta_boxes'
// 	 */	
// 	public function add_meta_boxes($post_type, $post) {
// 		
// 		if (isset($this->items)) {
// 		
// 			foreach ($this->items as $item) {
// 				
// 				if ($item['metabox'] && in_array($post_type, $item['post_types'])) {
// 			
// 					add_meta_box(
// 						$item['id'],
// 						$item['title'],
// 						array($this, 'print_meta_box'),
// 						$post_type,
// 						$item['context'],
// 						$item['priority'],
// 						$item
// 					);
// 				
// 				}
// 				
// 			}
// 		
// 		}
// 		
// 	}
// 
// 	/**
// 	 * Output the metabox
// 	 */
// 	public function print_meta_box($post, $metabox) {
// 	
// 		$this->print_item($post, $metabox['args']);
// 		
// 	}
// 	
// 	/**
// 	 * Print item by id
// 	 * Hook for 'gallery_box_print'
// 	 */
// 	public function print_item_by_id($post, $item_id) {
// 		
// 		$item = $this->find_by($item_id);
// 		
// 		if ($item) {
// 			
// 			$this->print_item($post, $item);
// 			
// 		}
// 		
// 	}
// 	
// 	/**
// 	 *	Print item
// 	 */
// 	public function print_item($post, $item) {
// 		
// 		wp_nonce_field($item['id'].'_submedia_action', $item['id'].'_submedia_nonce', false, true);
// 		
// 		$upload_link = esc_url( get_upload_iframe_src( 'image', ($post ? $post->ID : 0) ) );
// 
// 		$attachments = array();
// 		
// 		$attachment_ids = $post ? get_post_meta($post->ID, $item['id']) : array();
// 		
// 		if ($attachment_ids) {
// 		
// 			$attachments = get_posts(array(
// 				'post_type' => 'attachment',
// 				'post__in' => $attachment_ids,
// 				'nopaging' => true,
// 				'post_status' => 'any',
// 				'posts_per_page' => -1,
// 				'update_post_term_cache' => false,
// 				'orderby' => 'post__in',
// 				'order' => 'ASC'
// 			));
// 			
// 		}
// 		
// 		echo '<div class="gallery-box-content" id="gallery-box-'.$item['id'].'" data-types="'.implode(',', $item['media_types']).'">';
// 		
// 		echo '<a class="add-images" href="'.$upload_link.'">';
// 		echo '<div class="img-container">';
// 		
// 		$ids = array();
// 		
// 		if ($attachments) {
// 		
// 			foreach ($attachments as $attachment) {
// 				
// 				$ids[] = $attachment->ID;
// 				
// 				$type = get_post_mime_type($attachment->ID);
// 				
// 				switch ($type) {
// 					case 'image/jpeg':
// 					case 'image/png':
// 					case 'image/gif':
// 						$src_obj = wp_get_attachment_image_src($attachment->ID, 'thumbnail');
// 						$thumb_src = $src_obj[0];
// 						break;
// 					case 'video/mpeg':
// 					case 'video/mp4': 
// 					case 'video/quicktime':
// 					case 'text/csv':
// 					case 'text/plain': 
// 					case 'text/xml':
// 					default:
// 						$thumb_src = wp_mime_type_icon($type);
// 				}
// 				
// // 				$thumb_src = wp_get_attachment_image_src($attachment->ID, 'thumbnail');
// 				
// 				echo '<div class="img-wrapper" style="background-image:url('.$thumb_src.')"></div>';
// 				
// 			}
// 		
// 		}
// 		
// 		echo '</div>';
// 		echo '<div class="clear"></div>';
// 		
// 		echo '<p class="add-btn"'.(count($attachments) ? ' style="display:none"' : '').'>'.$item['button_name'].'</p>';
// 					
// 		echo '</a>';
// 		echo '<input class="images-id" name="'.$item['id'].'" type="hidden" value="'.implode(',', $ids).'" />';
// 	
// 		echo '</div>'; //.gallery-box-content
// 		
// 	}
// 	
// 	/**
// 	 *	save META BOX
// 	 */
// 	public function save_post($post_id, $post) {
// 		
// 		if ((!defined( 'DOING_AUTOSAVE') || !DOING_AUTOSAVE) && current_user_can( 'edit_post', $post_id)) {
// 			
// 			foreach ($this->items as $item) {
// 				
// 				if (isset($_POST[$item['id']], $_POST[$item['id'].'_submedia_nonce']) 
// 					&& (in_array($post->post_type, $item['post_types']))
// 					&& wp_verify_nonce($_POST[$item['id'].'_submedia_nonce'], $item['id'].'_submedia_action')) {
// 					
// 					$ids = array_filter(explode(',', $_POST[$item['id']]));
// 					
// 					if ($ids !== get_post_meta($post_id, $item['id'])) {
// 						
// 						delete_post_meta($post_id, $item['id']);
// 				
// 						foreach ($ids as $id) {
// 			
// 							add_post_meta($post_id, $item['id'], intval($id), false);
// 				
// 						}
// 						
// 					}
// 					
// 				}
// 				
// 			}
// 			
// 		}
// 		
// 	}
// 	
// 	/**
// 	 *	find item by id
// 	 */
// 	public function find_by($id) {
// 		
// 		foreach ($this->items as $item) {
// 			
// 			if ($item['id'] == $id) return $item;
// 		
// 		}
// 		
// 		return false;
// 	}
// 	
// 	/**
// 	 * Print javascript
// 	 */
// 	public function js($hook) {
// 		
// 		if ($this->items) {
// 			
// 			wp_enqueue_media();
// 			
// 			wp_enqueue_script('post-gallery-box', plugin_dir_url( __FILE__ ) . 'post-gallery-box.js' );
// 		
// 			$ids = '';
// 		
// 			foreach ($this->items as $item) {
// 			
// 				$ids .= '#gallery-box-'.$item['id'].',';
// 		
// 			}
// 			
// 			$ids = rtrim($ids, ',');
// 		
// 			wp_localize_script('post-gallery-box', 'pgb', array(
// 				'handler' => $ids
// 			));
// 			
// 		}
// 		
// 	}
// 	
	
}