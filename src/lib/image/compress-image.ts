import {
  ALLOWED_PHOTO_TYPES,
  UPLOAD_PHOTO_MAX_DIMENSION,
  UPLOAD_PHOTO_TARGET_BYTES,
} from "@/lib/constants";

type CompressImageOptions = {
  maxDimension?: number;
  targetBytes?: number;
  mimeType?: (typeof ALLOWED_PHOTO_TYPES)[number];
};

type CompressImageResult = {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression."));
    };
    image.src = url;
  });
}

function scaleDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const largest = Math.max(width, height);
  if (largest <= maxDimension) {
    return { width, height };
  }
  const ratio = maxDimension / largest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

/** Client-side image compression to keep uploads under server action limits. */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressImageResult> {
  const maxDimension = options.maxDimension ?? UPLOAD_PHOTO_MAX_DIMENSION;
  const targetBytes = options.targetBytes ?? UPLOAD_PHOTO_TARGET_BYTES;
  const outputMime =
    options.mimeType ??
    (ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])
      ? (file.type as (typeof ALLOWED_PHOTO_TYPES)[number])
      : "image/jpeg");

  const image = await loadImageFromFile(file);
  const { width, height } = scaleDimensions(
    image.naturalWidth,
    image.naturalHeight,
    maxDimension,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.92;
  let blob = await canvasToBlob(canvas, outputMime, quality);
  while (blob.size > targetBytes && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, outputMime, quality);
  }

  return { blob, mimeType: outputMime, width, height };
}

/** Compress an image file and return a new File ready for upload. */
export async function compressImageForUpload(file: File): Promise<File> {
  // Always normalize to JPEG so mobile HEIC/unknown types upload reliably.
  const { blob } = await compressImageFile(file, { mimeType: "image/jpeg" });
  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
