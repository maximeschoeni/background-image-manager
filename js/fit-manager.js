function createFitManager(image) {
	var manager = {
		width: 0,
		height: 0,
		size: "cover",
		position: "center",
		fit: function() {
			var ratio = (this.imageHeight || image.naturalHeight)/(this.imageWidth || image.naturalWidth);
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
			image.style.display = "block";
			
			image.parentNode.style.overflow = "hidden";
		},
		update: function() {
			this.width = image.parentNode && image.parentNode.clientWidth;
			this.height = image.parentNode && image.parentNode.clientHeight;
			if (this.width && this.height && (this.imageHeight || image.naturalHeight) && (this.imageWidth || image.naturalWidth)) {
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