import { PrismaClient } from "@prisma/client";
import { mockStore } from "./mock-store";

// Ensure DATABASE_URL exists during build time on platforms like Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/fallback?schema=public";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isDatabaseDown?: boolean;
  lastDbCheck?: number;
};

const realPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = realPrisma;
}

export function isDbConnectionError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("tenant") ||
    msg.includes("Can't reach database server") ||
    msg.includes("P1001") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("Database is possibly not accessible") ||
    msg.includes("database system is shutting down") ||
    msg.includes("PrismaClientInitializationError") ||
    msg.includes("closed the connection")
  );
}

const DB_RETRY_INTERVAL_MS = 60000;

export function isUsingDemoFallback(): boolean {
  return !!globalForPrisma.isDatabaseDown;
}

export function setDatabaseDown(isDown: boolean) {
  globalForPrisma.isDatabaseDown = isDown;
  globalForPrisma.lastDbCheck = Date.now();
}

// Create a transparent Proxy for Prisma models
function createModelProxy(modelName: "ticket" | "user" | "feedback" | "ticketLog") {
  return new Proxy(
    {},
    {
      get(_target, propKey: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return async (...args: any[]) => {
          const now = Date.now();
          const isDown = globalForPrisma.isDatabaseDown;
          const lastCheck = globalForPrisma.lastDbCheck || 0;

          // If DB is marked down and retry interval hasn't elapsed, directly use mockStore
          if (isDown && now - lastCheck < DB_RETRY_INTERVAL_MS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fallbackModel = (mockStore as any)[modelName];
            if (fallbackModel && typeof fallbackModel[propKey] === "function") {
              return fallbackModel[propKey](...args);
            }
          }

          // Attempt real Prisma call
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const realModel = (realPrisma as any)[modelName];
            if (realModel && typeof realModel[propKey] === "function") {
              const result = await realModel[propKey](...args);
              if (globalForPrisma.isDatabaseDown) {
                console.info("[DB RECOVERED] Koneksi Supabase PostgreSQL pulih! Menggunakan database cloud kembali.");
                globalForPrisma.isDatabaseDown = false;
              }
              return result;
            }
          } catch (error) {
            if (isDbConnectionError(error)) {
              if (!globalForPrisma.isDatabaseDown) {
                console.warn(
                  `[DB FALLBACK] Supabase database tidak terjangkau (kemungkinan paused). Menggunakan Demo Mock Store untuk ${modelName}.${propKey}.`
                );
              }
              globalForPrisma.isDatabaseDown = true;
              globalForPrisma.lastDbCheck = Date.now();

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const fallbackModel = (mockStore as any)[modelName];
              if (fallbackModel && typeof fallbackModel[propKey] === "function") {
                return fallbackModel[propKey](...args);
              }
            }
            throw error;
          }
        };
      },
    }
  );
}

export const prisma = new Proxy(realPrisma, {
  get(target, propKey: string) {
    if (
      propKey === "ticket" ||
      propKey === "user" ||
      propKey === "feedback" ||
      propKey === "ticketLog"
    ) {
      return createModelProxy(propKey);
    }

    if (propKey === "$transaction") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async (arg: any) => {
        const isDown = globalForPrisma.isDatabaseDown;
        const now = Date.now();
        const lastCheck = globalForPrisma.lastDbCheck || 0;

        if (isDown && now - lastCheck < DB_RETRY_INTERVAL_MS) {
          return mockStore.$transaction(arg);
        }

        try {
          return await realPrisma.$transaction(arg);
        } catch (error) {
          if (isDbConnectionError(error)) {
            globalForPrisma.isDatabaseDown = true;
            globalForPrisma.lastDbCheck = Date.now();
            return mockStore.$transaction(arg);
          }
          throw error;
        }
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target as any)[propKey];
  },
}) as unknown as PrismaClient;

export default prisma;
