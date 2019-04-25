<canvas <?php foreach ($canvas_attributes as $key => $value) { ?><?php echo $key; ?>="<?php echo $value; ?>" <?php } ?>>
	<?php include $this->plugin_path . 'include/image.php'; ?>
</canvas>
<script>
	registerBackgroundImage(document.getElementById("<?php echo $canvas_attributes['id']; ?>"), "<?php echo $size; ?>", "<?php echo $position; ?>");
</script>