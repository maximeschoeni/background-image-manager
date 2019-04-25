function createBackgroundImage(sources, size, position) {
	var image = new Image(sources[0].width, sources[0].height);
	image.src = sources[0].src;
	image.style.objectFit = size;
	image.style.objectPosition = position;
	image.style.width = "100%";
	image.style.height = "100%";
	return image;
}