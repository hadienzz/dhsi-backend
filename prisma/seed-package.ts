import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import { envConfig } from "../src/config/load-env";

export const creditPackageSeeds: Prisma.PricingPackageCreateManyInput[] = [
  {
    package_id: "basic",
    name: "Paket Dasar",
    price: new Prisma.Decimal("99000.00"),
    credits: 100,
    bonus: 0,
    bonus_label: null,
    validity: "Valid 30 hari",
    validity_days: 30,
    description: "Cocok untuk mencoba fitur dan kebutuhan belajar ringan.",
    highlight: null,
  },
  {
    package_id: "pro",
    name: "Paket Pro",
    price: new Prisma.Decimal("249000.00"),
    credits: 300,
    bonus: 30,
    bonus_label: "Bonus 10%",
    validity: "Valid 30 hari",
    validity_days: 30,
    description: "Untuk pengguna aktif yang butuh kredit lebih fleksibel.",
    highlight: "popular",
  },
  {
    package_id: "premium",
    name: "Paket Premium",
    price: new Prisma.Decimal("499000.00"),
    credits: 700,
    bonus: 105,
    bonus_label: "Bonus 15%",
    validity: "Valid 30 hari",
    validity_days: 30,
    description: "Pilihan terbaik untuk intensif belajar dan akses rutin.",
    highlight: null,
  },
  {
    package_id: "platinum",
    name: "Paket Platinum",
    price: new Prisma.Decimal("899000.00"),
    credits: 1400,
    bonus: 280,
    bonus_label: "Bonus 20%",
    validity: "Valid 60 hari",
    validity_days: 60,
    description: "Untuk kebutuhan profesional dengan volume penggunaan tinggi.",
    highlight: "best",
  },
  {
    package_id: "custom",
    name: "Custom",
    price: new Prisma.Decimal("0.00"),
    credits: 0,
    bonus: 0,
    bonus_label: null,
    validity: "Fleksibel",
    validity_days: null,
    description:
      "Silakan sampaikan kebutuhan Anda, tim kami akan membantu menyusun paket khusus.",
    highlight: "custom",
  },
];

export async function seedPackages(prismaClient: PrismaClient) {
  await prismaClient.pricingPackage.createMany({
    data: creditPackageSeeds,
    skipDuplicates: true,
  });
}

async function main() {
  const pool = new Pool({
    connectionString: envConfig.DATABASE_DIRECT_URL,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await seedPackages(prisma);
  console.log("✅ Credit packages seeded successfully");

  await prisma.$disconnect();
  await pool.end();
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
