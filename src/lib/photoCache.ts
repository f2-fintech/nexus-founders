// In-memory LRU-like cache for founder photo buffers (max 200 items ~ 6MB RAM)
export interface CachedPhoto {
  buffer: Buffer;
  contentType: string;
}

const photoCache = new Map<string, CachedPhoto>();
const MAX_CACHE_ITEMS = 200;

export function getCachedPhoto(id: string): CachedPhoto | undefined {
  return photoCache.get(id);
}

export function setCachedPhoto(id: string, photo: CachedPhoto) {
  if (photoCache.size >= MAX_CACHE_ITEMS) {
    const firstKey = photoCache.keys().next().value;
    if (firstKey) photoCache.delete(firstKey);
  }
  photoCache.set(id, photo);
}

export function invalidatePhotoCache(id?: string) {
  if (id) {
    photoCache.delete(id);
  } else {
    photoCache.clear();
  }
}
