import mongoose from "mongoose";
import dns from "dns";

// Prevent Windows querySrv ECONNREFUSED on MongoDB Atlas SRV connection strings
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  dns.setDefaultResultOrder?.("ipv4first");
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nexus-founders";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global._mongoose || { conn: null, promise: null };
if (!global._mongoose) {
  global._mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    dns.setDefaultResultOrder?.("ipv4first");
  } catch (e) {}

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,              // Allow up to 10 concurrent connections
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,       // Disconnect idle sockets after 45s
    };
    const DIRECT_REPLICA_URI =
      "mongodb://f2fintech-hrms:f2fintechltshrms@ac-4fl1shv-shard-00-00.1exq3rs.mongodb.net:27017,ac-4fl1shv-shard-00-01.1exq3rs.mongodb.net:27017,ac-4fl1shv-shard-00-02.1exq3rs.mongodb.net:27017/nexus-founders?ssl=true&replicaSet=atlas-tnenik-shard-0&authSource=admin";

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch(async (err) => {
        // If Windows DNS querySrv ECONNREFUSED occurs, fallback seamlessly to direct replica set hosts
        if (err?.message?.includes("querySrv") || err?.message?.includes("ECONNREFUSED")) {
          console.warn("[MongoDB] SRV lookup issue detected. Retrying with direct replica set hosts...");
          try {
            const fallbackConn = await mongoose.connect(DIRECT_REPLICA_URI, opts);
            cached.conn = fallbackConn;
            return fallbackConn;
          } catch (fallbackErr) {
            cached.promise = null;
            throw fallbackErr;
          }
        }
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}