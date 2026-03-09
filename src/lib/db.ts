import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Bump this version string whenever the schema changes to force a fresh client.
const SCHEMA_VERSION = "up-next-v3-no-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: string | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy singleton: only instantiate the client on first actual use.
// This prevents the build-time "DATABASE_URL not set" crash when Next.js
// imports route modules during static analysis / page data collection.
function getClient(): PrismaClient {
  const needsFresh =
    !globalForPrisma.prisma ||
    globalForPrisma.prismaSchemaVersion !== SCHEMA_VERSION;

  if (needsFresh) {
    const client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
      globalForPrisma.prismaSchemaVersion = SCHEMA_VERSION;
    }
    return client;
  }

  return globalForPrisma.prisma!;
}

// Export a Proxy so callers use `prisma.user.findMany(...)` as normal,
// but the real PrismaClient isn't created until the first property access.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});
