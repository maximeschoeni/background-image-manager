<div <?php foreach ($attributes as $key => $value) { ?><?php echo $key; ?>="<?php echo $value; ?>" <?php } ?>></div>
<script>
	registerBackgroundImage(document.getElementById("<?php echo $attributes['id']; ?>"), "<?php echo $size; ?>", "<?php echo $position; ?>")
</script>