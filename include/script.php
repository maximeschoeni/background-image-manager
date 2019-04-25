<?php 
	$display_method = $this->get_option('method', $this->default_method);
	$loading_method = $this->get_option('source', $this->default_source);
	$progressive = $this->get_option('progressive', $this->default_progressive);
?>
<script>
	var bim_option = <?php echo json_encode(array(
		'display_method' => $this->get_option('method', $this->default_method),
		'loading_method' => $this->get_option('source', $this->default_source),
		'progressive' => $this->get_option('progressive', $this->default_progressive)
	)) ?>;
	<?php 
		if ($display_method === 'image' || $display_method === 'object_fit' && $loading_method === 'auto-load') {
			include $this->plugin_path . 'js/image-manager.min.js';
		}
		if ($display_method === 'image') {
			include $this->plugin_path . 'js/fit-manager.min.js';
		}
		if ($display_method === 'canvas') {
			include $this->plugin_path . 'js/canvas-manager.min.js';
		}
		if ($display_method === 'background_image') {
			include $this->plugin_path . 'js/background-manager.min.js';
		}
		if ($loading_method === 'auto-load') {
			include $this->plugin_path . 'js/load-manager.min.js';
		}
	?>
	<?php //include $this->plugin_path . 'js/bim.js'; ?>
</script>