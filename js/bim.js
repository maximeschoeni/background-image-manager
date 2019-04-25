
function createBackgroundImage(sources, size, position) {
	var image = new Image(sources[0].width, sources[0].height);
	image.src = sources[0].src;
	registerBackgroundImage(image, size, position, sources);
	return image;
}
function onBackgroundImageLoad(image, size, position) {
	image.onload = null;
	image.removeAttribute("onload");
	registerBackgroundImage(image, size, position);
}
function registerBackgroundImage(image, size, position, sources) {
	if (bim_option.display_method === 'image') {
		var fitManager = createFitManager(image);
		fitManager.size = size;
		fitManager.position = position;
		fitManager.update();
	} else {
		image.style.objectFit = size;
		image.style.objectPosition = position;
		image.style.width = "100%";
		image.style.height = "100%";
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



/**
 * 
 */
function createFitManager(image) {
	var manager = {
		width: 0,
		height: 0,
		size: "cover",
		position: "center",
		fit: function() {
			var ratio = image.naturalHeight/image.naturalWidth;
			var containerRatio = this.height/this.width;
			var alignH = 0.5;
			var alignV = 0.5;
			var width, height;
			
			if (this.size === "cover" && ratio > containerRatio || this.size === "contain" && ratio < containerRatio) { // align width
				width = this.width;
				height = width*ratio;
			} else { // align height
				height = this.height;
				width = height/ratio;
			}
			if (this.position && this.position !== "center") {
				if (this.position.indexOf("left") > -1) alignH = 0;
				if (this.position.indexOf("right") > -1) alignH = 1;
				if (this.position.indexOf("top") > -1) alignV = 0;
				if (this.position.indexOf("bottom") > -1) alignV = 1;
			}
			var top = (this.height - height)*alignV;
			var left = (this.width - width)*alignH;
			image.style.top = top.toFixed() + "px";
			image.style.left = left.toFixed() + "px";
			image.style.width = width.toFixed() + "px";
			image.style.height = height.toFixed() + "px";
			image.parentNode.style.overflow = "hidden";
		},
		update: function() {
			this.width = image.offsetParent && image.offsetParent.clientWidth;
			this.height = image.offsetParent && image.offsetParent.clientHeight;
			if (this.width && this.height && image.naturalHeight && image.naturalWidth) {
				this.fit();
			}
		}
	};
	addEventListener("resize", function() {
		manager.update();
	});
	image.addEventListener("update", function() {
		manager.update();
	});
	return manager;
}






/**
 * 
 */
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


/**
 * 
 */
function createAutoLoaderManager() {
	var manager = {
		width: 0,
		height: 0,
		size: "cover",
		currentLevel: -1,
		pixelRatio: window.devicePixelRatio ? window.devicePixelRatio : 1,
		image: null,
// 		update: function () {		
// 			if (this.onRender) {
// 				this.onRender.apply(this);
// 			}
// 			this.upgrade();
// 		},
		getMinWidth: function() {
			if (this.image && this.image.naturalHeight && this.image.naturalHeight) {
				if (this.size === "contain") {
					return this.pixelRatio*Math.min(this.width, this.height*this.image.naturalWidth/this.image.naturalHeight);
				} else if (this.size === "cover") {
					return this.pixelRatio*Math.max(this.width, this.height*this.image.naturalWidth/this.image.naturalHeight);
				}
			}
			return this.width*this.pixelRatio;
		},
		upgrade: function() {
			var level = this.currentLevel;
			var minWidth = this.getMinWidth();
			function onload() {				
				if (level > manager.currentLevel) {	
					manager.currentLevel = level;
					manager.image = this;
					
					if (manager.onUpgrade) {
						manager.onUpgrade.apply(manager);
					}
					manager.upgrade();
				}
				this.removeEventListener("load", onload);
			}
			if (level + 1 < this.sources.length && minWidth > 0 && (level < 0 || this.sources[level].width < minWidth)) {
				level++;
			}
			if (this.progressive === false) {
				while(level + 1 < this.sources.length && this.sources[level].width < minWidth) {
					level++;
				}			
			}
			if (level > this.currentLevel) {
				var nextImage = new Image();
				nextImage.src = encodeURI(this.sources[level].src);				
				nextImage.addEventListener("load", onload);
			}
		},
		parseSrcset: function(srcset) {
			this.sources = [];
			var strings = srcset.split(",");
			for (var i = 0; i < strings.length; i++) {
				var parts = strings[i].match(/^\s?(.+?)\s+(\d+)w$/);
				if (parts && parts.length === 3) {
					this.sources.push({
						src: parts[1],
						width: parseInt(parts[2])
					});
				}
			}
			this.sortSources();
		},
		sortSources: function() {
			this.sources.sort(function(a, b) {
				if (a.width < b.width) return -1;
				else if (a.width > b.width) return 1;
				else return 0;
			});
		}
		
	};
	return manager;
}



// Canvas

 function createBackgroundCanvas(sources, size, position) {
	var canvas = createElement("canvas");
	var image = new Image(sources[0].width, sources[0].height);
	image.src = sources[0].src;
	canvas.appendChild(image);
	registerBackgroundCanvas(canvas, size, position, sources);
	return canvas;
}
function registerBackgroundCanvas(canvas, size, position, sources) {
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
		
		console.log("update");
		
		
		manager.update();
	});
	return manager;
}




// background-image

function registerBackground(div, size, position, sources) {
	
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







/**
 * 28/08/2018: bug fix quand plusieurs update en même temps
 */
// function createCanvasManager() {
// 	var pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
// 	var manager = {
// 		canvas: null,
// 		ctx: null,
// 		width: 0,
// 		height: 0,
// 		currentLevel: -1,
// 		image: null,
// 		create: function() {
// 			this.canvas = document.createElement("canvas");
// 			this.ctx = this.canvas.getContext("2d");
// 		},
// 		add: function(canvas) {
// 			this.canvas = canvas;
// 			this.ctx = this.canvas.getContext("2d");
// 			this.width = canvas.width;
// 			this.height = canvas.height;
// 		},
// 		update: function () {		
// 			this.canvas.width = this.width*pixelRatio;
// 			this.canvas.height = this.height*pixelRatio;
// 			this.canvas.style.width = this.width+"px";
// 			this.canvas.style.height = this.height+"px";
// 			this.render();
// 			this.upgrade();
// 		},
// 		render: function() {
// 			if (this.canvas.width && this.canvas.height && this.image) {
// 				if (this.size === "cover") {
// 					this.renderCover();
// 				} else if (this.size === "contain") {
// 					this.renderContain();
// 				} else {
// 					this.renderAuto();
// 				}
// 			}
// 		},
// 		renderContain: function () {
// 			var alignH = this.alignH || this.alignH === 0 ? parseFloat(this.alignH) : 0.5;
// 			var alignV = this.alignV || this.alignV === 0 ? parseFloat(this.alignV) : 0.5;
// 			var dWidth = Math.min(this.canvas.width, this.image.naturalWidth*this.canvas.height/this.image.naturalHeight);
// 			var dHeight = Math.min(this.canvas.height, this.image.naturalHeight*this.canvas.width/this.image.naturalWidth);
// 			var offsetX = Math.round((this.canvas.width-dWidth)*alignH);
// 			var offsetY = Math.round((this.canvas.height-dHeight)*alignV);
// 			this.ctx.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, offsetX, offsetY, dWidth, dHeight);
// 		},
// 		renderCover: function () {
// 			var alignH = this.alignH || this.alignH === 0 ? parseFloat(this.alignH) : 0.5;
// 			var alignV = this.alignV || this.alignV === 0 ? parseFloat(this.alignV) : 0.5;
// 			var sWidth = Math.min(this.image.naturalWidth, this.canvas.width*this.image.naturalHeight/this.canvas.height);
// 			var sHeight = Math.min(this.image.naturalHeight, this.canvas.height*this.image.naturalWidth/this.canvas.width);
// 			var offsetX = Math.round((this.image.naturalWidth-sWidth)*alignH);
// 			var offsetY = Math.round((this.image.naturalHeight-sHeight)*alignV);
// 			this.ctx.drawImage(this.image, offsetX, offsetY, sWidth, sHeight, 0, 0, this.canvas.width, this.canvas.height);
// 		},
// 		renderAuto: function() {
// 			this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
// 		},
// 		getMinWidth: function() {
// 			if (this.image && this.image.naturalHeight && this.image.naturalHeight) {
// 				if (this.size === "contain") {
// 					return pixelRatio*Math.min(this.width, this.height*this.image.naturalWidth/this.image.naturalHeight);
// 				} else if (this.size === "cover") {
// 					return pixelRatio*Math.max(this.width, this.height*this.image.naturalWidth/this.image.naturalHeight);
// 				}
// 			}
// 			return this.width*pixelRatio;
// 		},
// 		upgrade: function() {
// 			var level = this.currentLevel;
// 			var minWidth = this.getMinWidth();
// 			if (level + 1 < this.sources.length && minWidth > 0 && (level < 0 || this.sources[level].width < minWidth)) {
// 				level++;
// 			}
// 			if (this.progressive === false) {
// 				while(level + 1 < this.sources.length && this.sources[level].width < minWidth) {
// 					level++;
// 				}			
// 			}
// 			if (level > this.currentLevel) {
// 				var nextImage = new Image();
// 				nextImage.src = encodeURI(this.sources[level].src);				
// 				nextImage.addEventListener("load", function onload() {
// 					if (level > manager.currentLevel) {	
// 						manager.currentLevel = level;
// 						manager.image = this;
// 						manager.render();
// 						manager.canvas.setAttribute("data-src", manager.image.src);
// 						if (manager.onUpgrade) {
// 							manager.onUpgrade();
// 						}
// 						manager.upgrade();
// 					}
// 					this.removeEventListener("load", onload);
// 				});
// 			}
// 		},
// 		parseStyles: function(element) {
// 			var styles = window.getComputedStyle(element);
// 			this.size = styles.getPropertyValue("background-size")
// 			this.parsePosition(styles.getPropertyValue("background-position"));
// 		},
// 		parsePosition: function(position) {
// 			this.alignH = 0.5;
// 			this.alignV = 0.5;
// 			if (position && position !== "center") {
// 				if (position.indexOf("left") > -1) this.alignH = 0;
// 				if (position.indexOf("right") > -1) this.alignH = 1;
// 				if (position.indexOf("top") > -1) this.alignV = 0;
// 				if (position.indexOf("bottom") > -1) this.alignV = 1;
// 			}
// 		},
// 		parseSrcset: function(srcset) {
// 			this.sources = [];
// 			var strings = srcset.split(",");
// 			for (var i = 0; i < strings.length; i++) {
// 				var parts = strings[i].match(/^\s?(.+?)\s+(\d+)w$/);
// 				if (parts && parts.length === 3) {
// 					this.sources.push({
// 						src: parts[1],
// 						width: parseInt(parts[2])
// 					});
// 				}
// 			}
// 			this.sources.sort(function(a, b) {
// 				if (a.width < b.width) return -1;
// 				else if (a.width > b.width) return 1;
// 				else return 0;
// 			});
// 		}
// 	};
// 	return manager;
// }