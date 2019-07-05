function createFitManager(image) {
	var manager = {
		width: 0,
		height: 0,
		size: "cover",
		position: "center",
		fit: function(containerWidth, containerHeight, imageWidth, imageHeight) {
			var ratio = imageHeight/imageWidth;
			var containerRatio = containerHeight/containerWidth;
			var alignH = 0.5;
			var alignV = 0.5;
			var width, height;

			if (this.size === "cover" && ratio > containerRatio || this.size === "contain" && ratio < containerRatio) { // align width
				width = containerWidth;
				height = width*ratio;
			} else { // align height
				height = containerHeight;
				width = height/ratio;
			}
			if (this.position && this.position !== "center") {
				if (this.position.indexOf("left") > -1) alignH = 0;
				if (this.position.indexOf("right") > -1) alignH = 1;
				if (this.position.indexOf("top") > -1) alignV = 0;
				if (this.position.indexOf("bottom") > -1) alignV = 1;

				if (this.position.indexOf("%") > -1) {
					var percents = this.position.split(" ");
					if (percents[0].indexOf("%") === percents[0].length - 1) {
						alignV = parseInt(percents[0].slice(0, -1))/100;
					}
					if (percents.length === 2 && percents[1].indexOf("%") === percents[1].length - 1) {
						alignH = parseInt(percents[1].slice(0, -1))/100;
					}
				}
			}
			var top = (containerHeight - height)*alignV;
			var left = (containerWidth - width)*alignH;
			image.style.top = top.toFixed() + "px";
			image.style.left = left.toFixed() + "px";
			image.style.width = width.toFixed() + "px";
			image.style.height = height.toFixed() + "px";
			image.style.display = "block";
			image.parentNode.style.overflow = "hidden";
		},
		update: function() {

			var width = this.width || image.parentNode && image.parentNode.clientWidth;
			var height = this.height || image.parentNode && image.parentNode.clientHeight;
			var imageWidth = this.imageWidth || image.width || image.naturalWidth;
			var imageHeight = this.imageHeight || image.height || image.naturalHeight;
			if (width && height && imageHeight && imageWidth) {
				this.fit(width, height, imageWidth, imageHeight);
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
