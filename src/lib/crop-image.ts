import type { Area } from "react-easy-crop";

export async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area,
	backgroundColor: string = "#ffffff",
	fileType: string = "image/webp"
): Promise<Blob> {
	const image = new window.Image();
	image.src = imageSrc;
	await new Promise((resolve) => {
		image.onload = resolve;
	});

	const canvas = document.createElement("canvas");
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;
	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("No 2d context");

	// If not WebP/PNG or if the user chose a color, fill the background
	// For transparent formats, if transparent mode is selected, skip fill
	if (
		fileType === "image/jpeg" ||
		(fileType === "image/webp" && backgroundColor !== "transparent")
	) {
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Canvas is empty"));
			},
			fileType,
			0.85
		);
	});
}
