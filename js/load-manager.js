function createAutoLoaderManager() {
	var manager = {
		width: 0,
		height: 0,
		size: "cover",
		currentLevel: -1,
		pixelRatio: window.devicePixelRatio ? window.devicePixelRatio : 1,
		image: null,
		getMinWidth: function() {
			if (this.image) {
				if (this.size === "contain" && this.image.naturalHeight && this.image.naturalHeight) {
					return this.pixelRatio*Math.min(this.width, this.height*this.image.naturalWidth/this.image.naturalHeight);
				} else if (this.size === "cover" && this.image.naturalHeight && this.image.naturalHeight) {
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
