import Founder from "@/models/Founder";
import { connectDB } from "@/lib/mongodb";

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
      const founders = await Founder.find({ active: true })
        .select("name role company photo linkedin instagram googleplus twitter facebook youtube order createdAt")
        .sort({ order: 1, createdAt: 1 })
        .lean();

      cachedActiveFounders = founders as unknown as FounderData[];
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
