import type { Area } from "react-easy-crop";

export async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area
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

	return new Promise((resolve) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
			},
			"image/jpeg",
			0.95
		);
	});
}
