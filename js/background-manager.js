function createBackgroundImage(sources, size, position) {
	var div = createElement("div");
	div.style.backgroundImage = sources[0].src;
	div.style.backgroundSize = size;
	div.style.backgroundPosition = position;
	div.style.backgroundRepeat = "no-repeat";
	div.style.width = "100%";
	div.style.height = "100%";
	registerBackgroundImage(div, size, position, sources);
	return div;
}
function registerBackgroundImage(div, size, position, sources) {
	var loadManager = createBackgroundLoaderManager(div);
	loadManager.size = size;
	loadManager.progressive = bim_option.progressive;
	if (sources) {
		loadManager.sources = sources;
		loadManager.sortSources();
	} else if (div.hasAttribute("data-srcset")) {
		loadManager.parseSrcset(div.getAttribute("data-srcset"));
	}
	loadManager.update();
}
function createBackgroundLoaderManager(div) {
	var manager = createAutoLoaderManager();
	manager.update = function(width, height) {		
		width = width || div.offsetParent && div.offsetParent.clientWidth;
		height = height || div.offsetParent && div.offsetParent.clientHeight;
		if (width && height) {
			manager.width = width;
			manager.height = height;			
			manager.upgrade();
		}
	}
	manager.onUpgrade = function() {
		div.style.backgroundImage = "url("+this.image.src+")";
	};
	div.addEventListener("preload", function(event) {
		manager.update(event.detail.width, event.detail.height);
	});
	addEventListener("resize", function() {
		manager.update();
	});
	div.addEventListener("update", function() {
		manager.update();
	});
	return manager;
}