function createBackgroundImage(sources, size, position) {
	var image = new Image(sources[0].width, sources[0].height);
	image.src = sources[0].src;
	if (bim_option.display_method === 'object_fit' && (size === "cover" || size === "contain")) {
		image.style.objectFit = size;
		image.style.objectPosition = position;
		image.style.width = "100%";
		image.style.height = "100%";
	}
	if (size === "cover" || size === "contain") {
		image.style.position = "absolute";
	}
	registerBackgroundImage(image, size, position, sources);
	return image;
}
function onBackgroundImageLoad(image, size, position) {
	image.onload = null;
	image.removeAttribute("onload");
	registerBackgroundImage(image, size, position);
}
function onBackgroundVideo(video, size, position) {
	if (bim_option.display_method === "image") {
		var fitManager = createFitManager(video);
		fitManager.size = size;
		fitManager.position = position;
		fitManager.imageWidth = video.width;
		fitManager.imageHeight = video.height;
		fitManager.update();
	}
}
function registerBackgroundImage(image, size, position, sources) {

	if (bim_option.display_method === 'image' && (size === "cover" || size === "contain")) {
		var fitManager = createFitManager(image);
		fitManager.size = size;
		fitManager.position = position;
		fitManager.update();
	}
	if (bim_option.loading_method === 'auto-load') {
		var loadManager = createImageLoaderManager(image);
		loadManager.size = size;
		loadManager.progressive = bim_option.progressive;
		if (sources) {
			loadManager.sources = sources;
			loadManager.sortSources();
		} else if (image.hasAttribute("data-srcset")) {
			loadManager.parseSrcset(image.getAttribute("data-srcset"));
		}
		if (fitManager) {
			loadManager.onRender = function() {
				fitManager.update();
			};
		}
		loadManager.update();
	}
}
function createImageLoaderManager(image) {
	var manager = createAutoLoaderManager();
	manager.update = function(width, height) {
		width = width || image.parentNode && image.parentNode.clientWidth;
		height = height || image.parentNode && image.parentNode.clientHeight;
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
