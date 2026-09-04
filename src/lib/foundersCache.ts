import Founder from "@/models/Founder";
import { connectDB } from "@/lib/mongodb";
import { invalidatePhotoCache } from "@/lib/photoCache";

export interface FounderData {
  _id: string;
  name: string;
  role: string;
  company: string;
  photo?: string;
  linkedin?: string;
  instagram?: string;
  googleplus?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  order: number;
  createdAt?: string | Date;
}

let cachedActiveFounders: FounderData[] | null = null;
let lastCacheTime = 0;
let fetchPromise: Promise<FounderData[]> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in-memory cache

export function invalidateFoundersCache() {
  cachedActiveFounders = null;
  lastCacheTime = 0;
  fetchPromise = null;
  invalidatePhotoCache();
}

export async function getActiveFounders(): Promise<FounderData[]> {
  const now = Date.now();
  if (cachedActiveFounders && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedActiveFounders;
  }

  // Prevent thundering herd: reuse in-flight promise if multiple concurrent requests arrive
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      await connectDB();
      // Aggregate active founders without transferring heavy base64 strings
      const founders = await Founder.aggregate([
        { $match: { active: true } },
        {
          $project: {
            name: 1,
            role: 1,
            company: 1,
            order: 1,
            createdAt: 1,
            linkedin: 1,
            instagram: 1,
            googleplus: 1,
            twitter: 1,
            facebook: 1,
            youtube: 1,
            hasPhoto: { $gt: [{ $strLenCP: { $ifNull: ["$photo", ""] } }, 0] },
            photoUrl: {
              $cond: [
                { $regexMatch: { input: { $ifNull: ["$photo", ""] }, regex: "^https?://" } },
                "$photo",
                ""
              ]
            }
          }
        },
        { $sort: { order: 1, createdAt: 1 } }
      ]);

      cachedActiveFounders = founders.map((f: any) => ({
        _id: f._id.toString(),
        name: f.name || "",
        role: f.role || "",
        company: f.company || "",
        linkedin: f.linkedin || "",
        instagram: f.instagram || "",
        googleplus: f.googleplus || "",
        twitter: f.twitter || "",
        facebook: f.facebook || "",
        youtube: f.youtube || "",
        order: f.order ?? 0,
        createdAt: f.createdAt,
        photo: f.photoUrl ? f.photoUrl : (f.hasPhoto ? `/api/founders/${f._id.toString()}/photo` : ""),
      }));

      lastCacheTime = Date.now();
      return cachedActiveFounders;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

// Pre-warm cache on module load asynchronously
if (process.env.MONGODB_URI) {
  getActiveFounders().catch(() => {
    // Non-blocking background warm-up
  });
}
