import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { envConfig } from "../src/config/load-env";

const pool = new Pool({ connectionString: envConfig.DATABASE_DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.workshopModule.updateMany({
    where: { type: "video_discussion", zoom_url: null },
    data: {
      zoom_url: "https://zoom.us/j/example-discussion",
      whatsapp_group_url: "https://chat.whatsapp.com/example-discussion",
    },
  });
  console.log(
    `✅ Updated ${result.count} discussion modules with zoom_url + whatsapp_group_url`,
  );
  await prisma.$disconnect();
}
main();
