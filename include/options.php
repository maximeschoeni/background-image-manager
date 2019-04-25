<?php 
	$method = $this->get_option('method', $this->default_method);
	$source = $this->get_option('source', $this->default_source);
	$sizes = $this->get_option('sizes', get_intermediate_image_sizes());
	$progressive = $this->get_option('progressive', $this->default_progressive);
?>
<form action="<?php echo admin_url(); ?>" method="POST" id="bim-options">
	<?php wp_nonce_field($this->option_nonce_action, $this->option_nonce, true, true); ?>
	<h2>Settings</h2>
	<table class="form-table">
		<tbody>
			<tr>
				<th>Positioning Method</th>
				<td>
					<ul>
						<li>
							<input type="radio" name="bim_method" id="object_fit" value="object_fit" data-sources="basic,srcset,auto" <?php if ($method === 'object_fit') echo 'checked' ?>/>
							<label for="object_fit">Object-fit</label>
						</li>
						<li>
							<input type="radio" name="bim_method" id="image" value="image" data-sources="basic,srcset,auto" <?php if ($method === 'image') echo 'checked' ?>/>
							<label for="image">Image</label>
						</li>
						<!-- 
<li>
							<input type="radio" name="bim_method" id="auto" value="auto" data-sources="basic,srcset,auto" <?php if ($method === 'auto') echo 'checked' ?>/>
							<label for="auto">Detect IE</label>
						</li>
 -->
						<li>
							<input type="radio" name="bim_method" id="canvas" value="canvas" data-sources="auto" <?php if ($method === 'canvas') echo 'checked' ?>/>
							<label for="canvas">Canvas</label>
						</li>
						<li>
							<input type="radio" name="bim_method" id="background_image" value="background_image" data-sources="basic,auto" <?php if ($method === 'background_image') echo 'checked' ?>/>
							<label for="background_image">Background-image</label>
						</li>
					</ul>
				</td>
			</tr>
			<tr>
				<th>Loading Method</th>
				<td>
					<ul>
						
						<li>
							<input type="radio" name="bim_source" id="basic" value="basic" <?php if ($source === 'basic') echo 'checked' ?>/>
							<label for="basic">Basic</label>
						</li>
						<li>
							<input type="radio" name="bim_source" id="srcset" value="srcset" <?php if ($source === 'srcset') echo 'checked' ?>/>
							<label for="srcset">Srcset</label>
						</li>
						<li>
							<input type="radio" name="bim_source" id="auto-load" value="auto-load" <?php if ($source === 'auto-load') echo 'checked' ?>/>
							<label for="auto-load">Auto</label>
						</li>
						<li>
							<input type="checkbox" name="bim_progressive" id="progressive" value="progressive" <?php if ($progressive) echo 'checked' ?>/>
							<label for="progressive">Progressive</label>
						</li>
					</ul>
					
				</td>
			</tr>
			<tr>
				<th>Sizes</th>
				<td>
					<ul>
						<?php foreach (get_intermediate_image_sizes() as $size) { ?>
							<li>
								<input type="checkbox" name="bim_sizes[]" id="size-<?php echo $size; ?>" value="<?php echo $size; ?>" <?php if (in_array($size, $sizes)) echo 'checked' ?>/>
								<label for="size-<?php echo $size; ?>"><?php echo $size; ?></label>
							</li>
						<?php } ?>
					</ul>
				</td>
			</tr>
		</tbody>
	</table>
	<script>
		document.addEventListener("DOMContentLoaded", function(event) {
			var form = document.getElementById("bim-options");
			function onChange() {
				form["basic"].disabled = form["bim_method"].value === "canvas";
				form["srcset"].disabled = form["bim_method"].value === "canvas" || form["bim_method"].value === "background_image";
				form["bim_progressive"].disabled = form["bim_source"].value !== "auto-load" && form["bim_method"].value !== "canvas";
				if (form["bim_method"].value === "canvas") {
					form["auto-load"].checked = true;
				}
				if (form["bim_method"].value === "background_image" && form["bim_source"].value === "srcset") {
					form["basic"].checked = true;
				}
			}
			for (var i = 0; i < form.elements.length; i++) {
				form.elements[i].addEventListener("change", onChange);
			}
			onChange();
		});
	</script>
	<?php echo submit_button(); ?>
</form>