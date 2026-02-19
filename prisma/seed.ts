import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";
import { envConfig } from "../src/config/load-env";
import { seedPackages } from "./seed-package";
import { seedWorkshops } from "./seed-workshop";

const pool = new Pool({
  connectionString: envConfig.DATABASE_DIRECT_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@dhsi.com" },
  });

  let admin = existingAdmin;

  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    admin = await prisma.user.create({
      data: {
        email: "admin@dhsi.com",
        username: "Admin DHSI",
        password: hashedPassword,
        phone: "081234567890",
        role: "admin",
        is_verified: true,
      },
    });

    console.log("✅ Admin user created:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${admin.role}`);
  } else {
    console.log("✅ Admin user already exists:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
  }

  // Ensure wallet exists (optional, but useful for credit flows)
  const existingWallet = await prisma.userWallet.findUnique({
    where: { user_id: admin.id },
  });

  if (!existingWallet) {
    await prisma.userWallet.create({
      data: {
        user_id: admin.id,
        balance: 0,
      },
    });
    console.log("✅ Admin wallet created (balance=0)");
  }

  await seedPackages(prisma);
  console.log("✅ Pricing packages seeded");

  const workshopCount = await prisma.workshop.count();
  if (workshopCount === 0) {
    await seedWorkshops(prisma);
  } else {
    console.log(
      `⚠️  Workshops already exist (${workshopCount}), skipping workshop seed...`,
    );
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
