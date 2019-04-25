function createImageLoaderManager(image) {
	var manager = createAutoLoaderManager();
	manager.update = function(width, height) {
		width = width || image.offsetParent && image.offsetParent.clientWidth;
		height = height || image.offsetParent && image.offsetParent.clientHeight;
		if (width && height) {
			manager.width = width;
			manager.height = height;
			if (manager.onRender) {
				manager.onRender.apply(manager);
			}
			manager.upgrade();
		}
	}
	manager.onUpgrade = function() {
		image.src = this.image.src;
		if (manager.onRender) {
			manager.onRender.apply(manager);
		}
	};
	image.addEventListener("preload", function(event) {
		manager.update(event.detail.width, event.detail.height);
	});
	addEventListener("resize", function() {
		manager.update();
	});
	image.addEventListener("update", function() {
		manager.update();
	});
	return manager;
}