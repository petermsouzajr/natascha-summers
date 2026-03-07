/**
 * Seed file for natascha-summers
 *
 * Seed marker conventions — the clear() function uses these to identify
 * and cascade-delete all seed data:
 *
 *   Users          → email ends with  @seed.nataschasummers.com
 *   Votes          → paymentId starts with  seed_pay_
 *   ContentSuggestions → suggestedBy is a seed user (cleaned via user IDs)
 *   RecentContent  → youtubeLink contains  seed_natsummers
 *
 * Run:
 *   npm run db:seed          # clear existing seed data, then re-seed
 *   npm run db:seed:clear    # remove all seed data only
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
dotenv.config(); // fallback to .env

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ─── Seed Markers ─────────────────────────────────────────────────────────────

const SEED_EMAIL_SUFFIX = "@seed.nataschasummers.com";
const SEED_PAYMENT_PREFIX = "seed_pay_";
const SEED_YOUTUBE_MARKER = "seed_natsummers";

// ─── DB Client ────────────────────────────────────────────────────────────────

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set.\n" +
        "Copy .env.example to .env.local and fill in your database URL."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_PASSWORD = "SeedUser123!";

const SEED_USERS = [
  { email: `alice${SEED_EMAIL_SUFFIX}`, role: "user" },
  { email: `bob${SEED_EMAIL_SUFFIX}`, role: "user" },
  { email: `charlie${SEED_EMAIL_SUFFIX}`, role: "user" },
  { email: `seedadmin1${SEED_EMAIL_SUFFIX}`, role: "admin" },
  { email: `seedadmin2${SEED_EMAIL_SUFFIX}`, role: "admin" },
] as const;

// 5 movies
const SEED_MOVIES = [
  { title: "Dune: Part Two", type: "movie" },
  { title: "Oppenheimer", type: "movie" },
  { title: "Poor Things", type: "movie" },
  { title: "Parasite", type: "movie" },
  { title: "The Menu", type: "movie" },
] as const;

// 7 shows
const SEED_SHOWS = [
  { title: "The Bear", type: "show" },
  { title: "Shogun (2024)", type: "show" },
  { title: "Baby Reindeer", type: "show" },
  { title: "Ripley", type: "show" },
  { title: "The Penguin", type: "show" },
  { title: "Slow Horses", type: "show" },
  { title: "House of the Dragon", type: "show" },
] as const;

// 10 other — mostly YouTube content
const SEED_OTHER = [
  { title: "Hot Ones – Gordon Ramsay Full Episode", type: "other" },
  { title: "Sidemen Sunday Ultimate Charity Match", type: "other" },
  { title: "MrBeast: $1 vs $1,000,000 Hotel Room", type: "other" },
  { title: "Impaulsive Podcast #400 – KSI", type: "other" },
  { title: "Yes Theory: Moving Countries in 24 Hours", type: "other" },
  { title: "VFX Artists React: Most Insane Movie Scenes", type: "other" },
  { title: "Cold Ones: Most Chaotic Episode Yet", type: "other" },
  { title: "Danny Duncan's Cross-Country Road Trip", type: "other" },
  { title: "Jubilee: Americans vs Brits Middle Ground", type: "other" },
  { title: "Mark Rober: Glitter Bomb 7.0 vs Package Thieves", type: "other" },
] as const;

/**
 * Vote plan: [userIndex, contentTitle, voteType]
 *
 * userIndex maps to SEED_USERS:
 *   0 = alice      (user)
 *   1 = bob        (user)
 *   2 = charlie    (user)
 *   3 = seedadmin1 (admin)
 *   4 = seedadmin2 (admin)
 *
 * Resulting leaderboard order (by net votes):
 *   Movies:  Dune +5 > Poor Things +3 > Oppenheimer +3 > Parasite +1 > The Menu -1
 *   Shows:   The Bear +5 > Shogun +4 > Baby Reindeer +3 > Ripley +3 > Slow Horses +2 >
 *            The Penguin +2 > House of the Dragon -1
 *   Other:   Hot Ones +5 > Sidemen +4 > MrBeast +3 > Mark Rober +3 > Impaulsive +2 >
 *            VFX Artists +2 > Yes Theory +1 > Cold Ones +1 > Danny Duncan 0 > Jubilee -1
 */
const VOTE_PLAN: Array<[number, string, "up" | "down"]> = [
  // ── Movies ──────────────────────────────────────────────────────
  [0, "Dune: Part Two", "up"],
  [1, "Dune: Part Two", "up"],
  [2, "Dune: Part Two", "up"],
  [3, "Dune: Part Two", "up"],
  [4, "Dune: Part Two", "up"],

  [0, "Oppenheimer", "up"],
  [1, "Oppenheimer", "up"],
  [2, "Oppenheimer", "up"],
  [3, "Oppenheimer", "up"],
  [4, "Oppenheimer", "down"], // net +3

  [0, "Poor Things", "up"],
  [1, "Poor Things", "up"],
  [3, "Poor Things", "up"], // net +3

  [0, "Parasite", "up"],
  [1, "Parasite", "up"],
  [4, "Parasite", "down"], // net +1

  [2, "The Menu", "down"], // net -1

  // ── Shows ───────────────────────────────────────────────────────
  [0, "The Bear", "up"],
  [1, "The Bear", "up"],
  [2, "The Bear", "up"],
  [3, "The Bear", "up"],
  [4, "The Bear", "up"], // net +5

  [0, "Shogun (2024)", "up"],
  [1, "Shogun (2024)", "up"],
  [2, "Shogun (2024)", "up"],
  [3, "Shogun (2024)", "up"], // net +4

  [0, "Baby Reindeer", "up"],
  [1, "Baby Reindeer", "up"],
  [2, "Baby Reindeer", "up"], // net +3

  [1, "Ripley", "up"],
  [2, "Ripley", "up"],
  [3, "Ripley", "up"], // net +3

  [0, "Slow Horses", "up"],
  [3, "Slow Horses", "up"], // net +2

  [0, "The Penguin", "up"],
  [2, "The Penguin", "up"], // net +2

  [1, "House of the Dragon", "up"],
  [2, "House of the Dragon", "down"],
  [3, "House of the Dragon", "down"], // net -1

  // ── Other ───────────────────────────────────────────────────────
  [0, "Hot Ones – Gordon Ramsay Full Episode", "up"],
  [1, "Hot Ones – Gordon Ramsay Full Episode", "up"],
  [2, "Hot Ones – Gordon Ramsay Full Episode", "up"],
  [3, "Hot Ones – Gordon Ramsay Full Episode", "up"],
  [4, "Hot Ones – Gordon Ramsay Full Episode", "up"], // net +5

  [0, "Sidemen Sunday Ultimate Charity Match", "up"],
  [1, "Sidemen Sunday Ultimate Charity Match", "up"],
  [2, "Sidemen Sunday Ultimate Charity Match", "up"],
  [3, "Sidemen Sunday Ultimate Charity Match", "up"], // net +4

  [0, "MrBeast: $1 vs $1,000,000 Hotel Room", "up"],
  [1, "MrBeast: $1 vs $1,000,000 Hotel Room", "up"],
  [2, "MrBeast: $1 vs $1,000,000 Hotel Room", "up"], // net +3

  [0, "Impaulsive Podcast #400 – KSI", "up"],
  [3, "Impaulsive Podcast #400 – KSI", "up"], // net +2

  [2, "VFX Artists React: Most Insane Movie Scenes", "up"],
  [3, "VFX Artists React: Most Insane Movie Scenes", "up"], // net +2

  [1, "Yes Theory: Moving Countries in 24 Hours", "up"],
  [2, "Yes Theory: Moving Countries in 24 Hours", "up"],
  [4, "Yes Theory: Moving Countries in 24 Hours", "down"], // net +1

  [0, "Cold Ones: Most Chaotic Episode Yet", "up"], // net +1

  [4, "Danny Duncan's Cross-Country Road Trip", "up"],
  [0, "Danny Duncan's Cross-Country Road Trip", "down"], // net 0

  [2, "Jubilee: Americans vs Brits Middle Ground", "down"], // net -1

  [3, "Mark Rober: Glitter Bomb 7.0 vs Package Thieves", "up"],
  [4, "Mark Rober: Glitter Bomb 7.0 vs Package Thieves", "up"],
  [0, "Mark Rober: Glitter Bomb 7.0 vs Package Thieves", "up"], // net +3
];

// Recent content for the homepage grid (seeded for visual completeness)
const SEED_RECENT = [
  {
    title: "Dune: Part Two Full Reaction",
    type: "movie",
    youtubeLink: `https://www.youtube.com/watch?v=SEED_NS_MOV001&ref=${SEED_YOUTUBE_MARKER}`,
    posterUrl: null,
  },
  {
    title: "Oppenheimer 3-Hour Reaction",
    type: "movie",
    youtubeLink: `https://www.youtube.com/watch?v=SEED_NS_MOV002&ref=${SEED_YOUTUBE_MARKER}`,
    posterUrl: null,
  },
  {
    title: "The Bear S3 Episode 1 – I Wasn't Ready",
    type: "show",
    youtubeLink: `https://www.youtube.com/watch?v=SEED_NS_SHW001&ref=${SEED_YOUTUBE_MARKER}`,
    posterUrl: null,
  },
  {
    title: "Baby Reindeer – I Cried Three Times",
    type: "show",
    youtubeLink: `https://www.youtube.com/watch?v=SEED_NS_SHW002&ref=${SEED_YOUTUBE_MARKER}`,
    posterUrl: null,
  },
  {
    title: "Watch Party – Hot Ones Live Stream",
    type: "live",
    youtubeLink: `https://www.youtube.com/watch?v=SEED_NS_LVE001&ref=${SEED_YOUTUBE_MARKER}`,
    posterUrl: null,
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const prisma = createClient();
  console.log("🌱 Seeding natascha-summers database...\n");

  // Always start clean so re-running is idempotent
  await clearData(prisma);

  // ── Users ────────────────────────────────────────────────────────
  console.log("👤 Creating seed users...");
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const createdUsers = await Promise.all(
    SEED_USERS.map((u) =>
      prisma.user.create({
        data: { email: u.email, passwordHash, role: u.role, isVerified: true },
      })
    )
  );
  console.log(`   ✅ ${createdUsers.length} users (3 regular, 2 admin)`);

  // ── Content Suggestions ──────────────────────────────────────────
  console.log("🎬 Creating content suggestions...");
  const allContent = [
    ...SEED_MOVIES,
    ...SEED_SHOWS,
    ...SEED_OTHER,
  ] as readonly { title: string; type: string }[];

  const createdContent = await Promise.all(
    allContent.map((c) =>
      prisma.contentSuggestion.create({
        data: {
          title: c.title,
          type: c.type,
          status: "approved",
          suggestedBy: createdUsers[0].id, // alice suggests all seed content
        },
      })
    )
  );

  const contentByTitle = new Map(createdContent.map((c) => [c.title, c]));
  console.log(
    `   ✅ ${SEED_MOVIES.length} movies, ${SEED_SHOWS.length} shows, ${SEED_OTHER.length} other`
  );

  // ── Votes ────────────────────────────────────────────────────────
  console.log("🗳️  Creating votes...");
  let voteCount = 0;
  let voteSkipped = 0;

  for (const [userIndex, contentTitle, voteType] of VOTE_PLAN) {
    const user = createdUsers[userIndex];
    const content = contentByTitle.get(contentTitle);

    if (!user || !content) {
      console.warn(
        `   ⚠️  Skipping: user[${userIndex}] or "${contentTitle}" not found`
      );
      voteSkipped++;
      continue;
    }

    // Deterministic paymentId — safe to re-run without duplicate key errors
    // (clearData deletes by prefix, so this is always fresh after clear)
    const slug = contentTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 20);
    const paymentId = `${SEED_PAYMENT_PREFIX}${slug}_u${userIndex}_${voteType}`;

    await prisma.vote.create({
      data: {
        contentId: content.id,
        userId: user.id,
        voteType,
        paymentId,
      },
    });
    voteCount++;
  }

  if (voteSkipped > 0) {
    console.log(`   ⚠️  ${voteSkipped} votes skipped (data mismatch)`);
  }
  console.log(`   ✅ ${voteCount} votes created`);

  // ── Recent Content ───────────────────────────────────────────────
  console.log("📺 Creating recent content...");
  const recentItems = await Promise.all(
    SEED_RECENT.map((item) => prisma.recentContent.create({ data: item }))
  );
  console.log(`   ✅ ${recentItems.length} recent content items`);

  await prisma.$disconnect();

  console.log("\n✨ Seed complete!\n");
  printCredentials();
}

// ─── Clear ────────────────────────────────────────────────────────────────────

async function clear() {
  const prisma = createClient();
  console.log("🧹 Clearing seed data...\n");
  await clearData(prisma);
  await prisma.$disconnect();
  console.log("✅ All seed data removed.\n");
}

async function clearData(prisma: PrismaClient) {
  // 1. Delete all seed votes first (foreign key safe — votes reference users/content)
  const votes = await prisma.vote.deleteMany({
    where: { paymentId: { startsWith: SEED_PAYMENT_PREFIX } },
  });

  // 2. Find seed user IDs to locate their content suggestions
  const seedUsers = await prisma.user.findMany({
    where: { email: { endsWith: SEED_EMAIL_SUFFIX } },
    select: { id: true },
  });
  const seedUserIds = seedUsers.map((u) => u.id);

  // 3. Delete content suggestions made by seed users
  //    (their votes are already gone from step 1)
  let suggestions = { count: 0 };
  if (seedUserIds.length > 0) {
    // Safety: also delete any remaining votes on these suggestions
    // (e.g. from real users in development — shouldn't exist in prod)
    const suggestionIds = await prisma.contentSuggestion.findMany({
      where: { suggestedBy: { in: seedUserIds } },
      select: { id: true },
    });
    if (suggestionIds.length > 0) {
      await prisma.vote.deleteMany({
        where: { contentId: { in: suggestionIds.map((s) => s.id) } },
      });
    }
    suggestions = await prisma.contentSuggestion.deleteMany({
      where: { suggestedBy: { in: seedUserIds } },
    });
  }

  // 4. Delete seed users
  const users = await prisma.user.deleteMany({
    where: { email: { endsWith: SEED_EMAIL_SUFFIX } },
  });

  // 5. Delete seed recent content (identified by YouTube URL marker)
  const recent = await prisma.recentContent.deleteMany({
    where: { youtubeLink: { contains: SEED_YOUTUBE_MARKER } },
  });

  const total = votes.count + suggestions.count + users.count + recent.count;
  if (total > 0) {
    console.log(
      `   Removed: ${votes.count} votes · ${suggestions.count} suggestions · ` +
        `${users.count} users · ${recent.count} recent items`
    );
  } else {
    console.log("   Nothing to remove (no seed data found)");
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printCredentials() {
  console.log("Seed credentials (all share the same password):");
  console.log(`  Password: ${SEED_PASSWORD}\n`);
  console.log("  Regular users:");
  SEED_USERS.filter((u) => u.role === "user").forEach((u) =>
    console.log(`    ${u.email}`)
  );
  console.log("  Admin users:");
  SEED_USERS.filter((u) => u.role === "admin").forEach((u) =>
    console.log(`    ${u.email}`)
  );
  console.log();
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

const isClear = process.argv.includes("--clear");

if (isClear) {
  clear()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Clear failed:", e);
      process.exit(1);
    });
} else {
  seed()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Seed failed:", e);
      process.exit(1);
    });
}
