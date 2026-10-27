export const DOLL_IMAGES = {
  male: {
    preview: "./dolls/talisman-male-480.webp",
    full: "./dolls/talisman-male-768.webp",
  },
  female: {
    preview: "./dolls/talisman-female-480.webp",
    full: "./dolls/talisman-female-768.webp",
  },
} as const;

export const LINE_QR_SRC = "./line-qr.png";

// Keep decoded images available across steps and repeated downloads.
// Failed requests are removed so the next attempt can retry.
const decodedImages = new Map<string, Promise<HTMLImageElement>>();

export function loadGameImage(src: string): Promise<HTMLImageElement> {
  const url = new URL(src, document.baseURI).href;
  const cached = decodedImages.get(url);
  if (cached) return cached;

  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = "low";
  image.src = url;
  const pending = image.decode().then(() => image).catch((error) => {
    decodedImages.delete(url);
    throw error;
  });
  decodedImages.set(url, pending);
  return pending;
}
