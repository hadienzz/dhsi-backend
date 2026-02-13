import prisma from "../src/database/prisma";

import { Prisma } from "../generated/prisma/client";

export const creditPackageSeeds: Prisma.PricingPackageCreateManyInput[] = [
  {
    package_id: "basic",
    name: "Paket Dasar",
    price: 99000,
    credits: 100,
    bonus: 0,
    bonus_label: null,
    validity: "Valid 30 hari",
    description: "Cocok untuk mencoba fitur dan kebutuhan belajar ringan.",
    highlight: null,
  },
  {
    package_id: "pro",
    name: "Paket Pro",
    price: 249000,
    credits: 300,
    bonus: 30,
    bonus_label: "Bonus 10%",
    validity: "Valid 30 hari",
    description: "Untuk pengguna aktif yang butuh kredit lebih fleksibel.",
    highlight: "popular",
  },
  {
    package_id: "premium",
    name: "Paket Premium",
    price: 499000,
    credits: 700,
    bonus: 105,
    bonus_label: "Bonus 15%",
    validity: "Valid 30 hari",
    description: "Pilihan terbaik untuk intensif belajar dan akses rutin.",
    highlight: null,
  },
  {
    package_id: "platinum",
    name: "Paket Platinum",
    price: 899000,
    credits: 1400,
    bonus: 280,
    bonus_label: "Bonus 20%",
    validity: "Valid 60 hari",
    description: "Untuk kebutuhan profesional dengan volume penggunaan tinggi.",
    highlight: "best",
  },
  {
    package_id: "custom",
    name: "Custom",
    price: 0,
    credits: 0,
    bonus: 0,
    bonus_label: null,
    validity: "Fleksibel",
    description:
      "Silakan sampaikan kebutuhan Anda, tim kami akan membantu menyusun paket khusus.",
    highlight: "custom",
  },
];

async function main() {
  await prisma.pricingPackage.createMany({
    data: creditPackageSeeds,
    skipDuplicates: true,
  });

  console.log("✅ Credit packages seeded successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
