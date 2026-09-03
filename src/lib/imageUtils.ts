/**
 * Converts any image File (JPEG, PNG, BMP, TIFF, etc.) to WebP format in the browser
 * before uploading to the server.
 */
export async function convertToWebP(file: File, quality = 0.9): Promise<File> {
  // If already WebP, return immediately
  if (file.type === "image/webp") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // fallback to server-side sharp conversion
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      } catch (err) {
        console.warn("Client WebP conversion error, fallback to original:", err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback to server-side sharp conversion
    };

    img.src = url;
  });
}
