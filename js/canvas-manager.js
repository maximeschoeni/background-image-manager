function createBackgroundImage(sources, size, position) {
	var canvas = createElement("canvas");
	var image = new Image(sources[0].width, sources[0].height);
	image.src = sources[0].src;
	canvas.appendChild(image);
	registerBackgroundCanvas(canvas, size, position, sources);
	return canvas;
}
function registerBackgroundImage(canvas, size, position, sources) {
	var loadManager = createCanvasManager(canvas);
	loadManager.size = size;
	loadManager.progressive = bim_option.progressive;
	if (sources) {
		loadManager.sources = sources;
		loadManager.sortSources();
	} else if (canvas.children[0] && canvas.children[0].hasAttribute("srcset")) {
		loadManager.parseSrcset(canvas.children[0].getAttribute("srcset"));
	}
	loadManager.update();
}
function createCanvasManager(canvas) {
	var manager = createAutoLoaderManager();
	var alignH = 0.5;
	var alignV = 0.5;
	var ctx = canvas.getContext("2d");	
	function renderContain() {
		var dWidth = Math.min(canvas.width, manager.image.naturalWidth*canvas.height/manager.image.naturalHeight);
		var dHeight = Math.min(canvas.height, manager.image.naturalHeight*canvas.width/manager.image.naturalWidth);
		var offsetX = Math.round((canvas.width-dWidth)*alignH);
		var offsetY = Math.round((canvas.height-dHeight)*alignV);
		ctx.drawImage(manager.image, 0, 0, manager.image.naturalWidth, manager.image.naturalHeight, offsetX, offsetY, dWidth, dHeight);
	}
	function renderCover() {
		var sWidth = Math.min(manager.image.naturalWidth, canvas.width*manager.image.naturalHeight/canvas.height);
		var sHeight = Math.min(manager.image.naturalHeight, canvas.height*manager.image.naturalWidth/canvas.width);
		var offsetX = Math.round((manager.image.naturalWidth-sWidth)*alignH);
		var offsetY = Math.round((manager.image.naturalHeight-sHeight)*alignV);
		ctx.drawImage(manager.image, offsetX, offsetY, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
	}
	function renderAuto() {
		ctx.drawImage(manager.image, 0, 0, canvas.width, canvas.height);
	}
	manager.update = function (width, height) {
		width = width || canvas.offsetParent && canvas.offsetParent.clientWidth;
		height = height || canvas.offsetParent && canvas.offsetParent.clientHeight;
		if (width && height) {
			manager.width = width;
			manager.height = height;
			if (manager.position && manager.position !== "center") {
				if (manager.position.indexOf("left") > -1) alignH = 0;
				if (manager.position.indexOf("right") > -1) alignH = 1;
				if (manager.position.indexOf("top") > -1) alignV = 0;
				if (manager.position.indexOf("bottom") > -1) alignV = 1;
			}			
			canvas.width = manager.width*manager.pixelRatio;
			canvas.height = manager.height*manager.pixelRatio;
			canvas.style.width = manager.width+"px";
			canvas.style.height = manager.height+"px";
			manager.render();
			manager.upgrade();
		}
	};
	manager.render = function() {
		if (canvas.width && canvas.height && manager.image) {
			if (manager.size === "cover") {
				renderCover();
			} else if (manager.size === "contain") {
				renderContain();
			} else {
				renderAuto();
			}
		}
	};
	manager.onUpgrade = function() {
		canvas.setAttribute("data-src", manager.image.src);
		manager.render();
	};
	canvas.addEventListener("preload", function(event) {
		manager.update(event.detail.width, event.detail.height);
	});
	addEventListener("resize", function() {
		manager.update();
	});
	canvas.addEventListener("update", function() {
		manager.update();
	});
	return manager;
}