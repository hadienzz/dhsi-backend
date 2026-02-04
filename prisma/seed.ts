import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";
import { envConfig } from "../src/config/load-env";

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

  if (existingAdmin) {
    console.log("⚠️  Admin user already exists, skipping...");
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@dhsi.com",
      username: "Admin DHSI",
      password: hashedPassword,
      phone: "081234567890",
      role: "admin",
    },
  });

  console.log("✅ Admin user created:");
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: admin123`);
  console.log(`   Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });