import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import { envConfig } from "../src/config/load-env";
import bcrypt from "bcrypt";

export async function seedWorkshops(prismaClient: PrismaClient) {
  console.log("🗑️  Cleaning old workshop data...");
  await prismaClient.workshopModuleProgress.deleteMany({});
  await prismaClient.workshopPayment.deleteMany({});
  await prismaClient.workshopCreditPurchase.deleteMany({});
  await prismaClient.workshopRating.deleteMany({});
  await prismaClient.likedWorkshop.deleteMany({});
  await prismaClient.selectedWorkshop.deleteMany({});
  await prismaClient.workshopModule.deleteMany({});
  await prismaClient.workshop.deleteMany({});
  console.log("✅ Old data cleaned.\n");

  console.log("🌱 Seeding workshops...");

  const admin = await prismaClient.user.findFirst({ where: { role: "admin" } });
  const anyUser = admin ?? (await prismaClient.user.findFirst());

  const seedUser =
    anyUser ??
    (await prismaClient.user.create({
      data: {
        email: "admin@dhsi.com",
        username: "Admin DHSI",
        password: await bcrypt.hash("admin123", 10),
        phone: "081234567890",
        role: "admin",
      },
    }));

  console.log(`📌 Using user: ${seedUser.email} (${seedUser.id})`);

  // ─── Workshop 1: Dasar Hukum Siber Indonesia ───
  const ws1 = await prismaClient.workshop.create({
    data: {
      title: "Dasar Hukum Siber Indonesia",
      description:
        "Workshop komprehensif yang membahas fondasi hukum siber di Indonesia, termasuk UU ITE, regulasi terkait, dan implementasinya dalam praktik hukum sehari-hari. Peserta akan memahami kerangka hukum yang mengatur aktivitas digital di Indonesia.",
      short_description:
        "Pelajari fondasi hukum siber Indonesia: UU ITE, regulasi digital, dan implementasi praktis.",
      thumbnail:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      category: "Hukum Siber",
      benefits: [
        "Memahami UU ITE dan perubahannya",
        "Mengenal regulasi data digital di Indonesia",
        "Praktik penanganan kasus hukum siber",
        "Studi kasus terkini hukum siber",
      ],
      credit_price: 250,
      user_id: seedUser.id,
      price: 250000,
    },
  });

  await prismaClient.workshopModule.createMany({
    data: [
      {
        // video_discussion → YouTube + Zoom diskusi
        workshop_id: ws1.id,
        title: "Pengantar Hukum Siber di Indonesia",
        type: "video_discussion",
        order: 1,
        schedule_at: new Date("2026-03-01"),
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        zoom_url: "https://zoom.us/j/hukum-siber-diskusi-1",
        description:
          "Modul pengantar yang membahas sejarah dan perkembangan hukum siber di Indonesia, dari awal munculnya internet hingga regulasi terkini.",
        content_text:
          "Hukum siber di Indonesia mulai berkembang seiring dengan meningkatnya penggunaan internet. Undang-Undang Informasi dan Transaksi Elektronik (UU ITE) pertama kali disahkan pada tahun 2008 sebagai landasan hukum utama untuk mengatur aktivitas di dunia digital.\n\nTopik yang dibahas:\n1. Sejarah regulasi digital di Indonesia\n2. Latar belakang lahirnya UU ITE\n3. Perkembangan amandemen UU ITE\n4. Perbandingan dengan negara lain",
      },
      {
        // video_exam → YouTube + Google Form ujian
        workshop_id: ws1.id,
        title: "UU ITE: Pasal-Pasal Krusial",
        type: "video_exam",
        order: 2,
        schedule_at: new Date("2026-03-03"),
        youtube_url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        exam_form_url: "https://forms.google.com/example-uu-ite",
        description:
          "Pembahasan mendalam pasal-pasal krusial dalam UU ITE yang sering menjadi dasar penuntutan dan pembelaan di pengadilan.",
        content_text:
          "Dalam modul ini kita akan membahas pasal-pasal kritis dalam UU ITE:\n\n• Pasal 27 - Muatan yang dilarang\n• Pasal 28 - Berita bohong dan ujaran kebencian\n• Pasal 29 - Ancaman kekerasan\n• Pasal 30 - Akses ilegal\n• Pasal 32 - Gangguan terhadap sistem elektronik\n\nSetiap pasal akan dibahas beserta contoh kasus nyata.",
      },
      {
        // live_class_exam → Zoom live class + Google Form ujian
        workshop_id: ws1.id,
        title: "Praktik Penanganan Kasus Hukum Siber",
        type: "live_class_exam",
        order: 3,
        schedule_at: new Date("2026-03-05"),
        zoom_url: "https://zoom.us/j/hukum-siber-liveclass-3",
        exam_form_url: "https://forms.google.com/example-praktik-kasus",
        description:
          "Sesi live class bersama instruktur untuk membahas praktik penanganan kasus hukum siber secara langsung.",
        content_text:
          "Sesi live class interaktif:\n\n1. Simulasi penanganan kasus pencemaran nama baik online\n2. Prosedur pelaporan ke Bareskrim Siber\n3. Teknik pengumpulan bukti digital\n4. Strategi pembelaan dalam kasus UU ITE\n\nSetelah live class, peserta wajib mengerjakan ujian.",
      },
      {
        // exam_only → Google Form saja
        workshop_id: ws1.id,
        title: "Ujian Akhir: Dasar Hukum Siber",
        type: "exam_only",
        order: 4,
        schedule_at: new Date("2026-03-07"),
        exam_form_url: "https://forms.google.com/example-final-exam-1",
        description:
          "Ujian akhir untuk mengukur pemahaman peserta terhadap materi Dasar Hukum Siber Indonesia.",
        content_text:
          "Ujian mencakup seluruh materi dari modul 1-3. Kerjakan ujian melalui link yang disediakan. Passing grade: 70%.",
      },
    ],
  });

  console.log(`✅ Workshop 1: "${ws1.title}" — 4 modules`);

  // ─── Workshop 2: Perlindungan Data Pribadi (PDP) ───
  const ws2 = await prismaClient.workshop.create({
    data: {
      title: "Perlindungan Data Pribadi (PDP)",
      description:
        "Workshop mendalam tentang Undang-Undang Perlindungan Data Pribadi (UU PDP) yang baru disahkan. Pelajari hak-hak subjek data, kewajiban pengendali data, dan cara menyusun kebijakan privasi yang sesuai regulasi.",
      short_description:
        "Kuasai UU PDP: hak subjek data, kewajiban pengendali, dan kebijakan privasi.",
      thumbnail:
        "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80",
      category: "Privasi Data",
      benefits: [
        "Memahami UU PDP secara menyeluruh",
        "Menyusun kebijakan privasi yang compliant",
        "Mengelola consent management",
        "Menangani data breach sesuai regulasi",
        "Studi kasus GDPR vs UU PDP",
      ],
      credit_price: 500,
      user_id: seedUser.id,
      price: 500000,
    },
  });

  await prismaClient.workshopModule.createMany({
    data: [
      {
        // video_discussion → YouTube + Zoom diskusi
        workshop_id: ws2.id,
        title: "Pengantar UU Perlindungan Data Pribadi",
        type: "video_discussion",
        order: 1,
        schedule_at: new Date("2026-03-10"),
        youtube_url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        zoom_url: "https://zoom.us/j/pdp-diskusi-1",
        description:
          "Mengenal UU PDP: latar belakang, ruang lingkup, dan definisi-definisi penting.",
        content_text:
          "UU Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022 merupakan tonggak penting dalam regulasi data di Indonesia.\n\nMateri pembahasan:\n1. Latar belakang penyusunan UU PDP\n2. Definisi data pribadi: umum vs spesifik\n3. Subjek data vs pengendali data vs prosesor data\n4. Ruang lingkup penerapan (termasuk lintas batas)",
      },
      {
        // video_exam → YouTube + Google Form ujian
        workshop_id: ws2.id,
        title: "Hak-Hak Subjek Data",
        type: "video_exam",
        order: 2,
        schedule_at: new Date("2026-03-12"),
        youtube_url: "https://www.youtube.com/watch?v=RgKAFK5djSk",
        exam_form_url: "https://forms.google.com/example-hak-subjek-data",
        description:
          "Pembahasan lengkap hak-hak subjek data berdasarkan UU PDP dan cara mengimplementasikannya.",
        content_text:
          "Hak-hak subjek data yang dijamin UU PDP:\n\n• Hak untuk mendapatkan informasi\n• Hak untuk memperbaiki data\n• Hak untuk menghapus data (right to be forgotten)\n• Hak untuk menarik kembali persetujuan\n• Hak untuk memindahkan data (data portability)\n• Hak untuk mengajukan keberatan",
      },
      {
        // video_discussion → YouTube + Zoom diskusi
        workshop_id: ws2.id,
        title: "Kewajiban Pengendali & Prosesor Data",
        type: "video_discussion",
        order: 3,
        schedule_at: new Date("2026-03-14"),
        youtube_url: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
        zoom_url: "https://zoom.us/j/pdp-diskusi-3",
        description:
          "Kewajiban hukum yang harus dipenuhi oleh pengendali dan prosesor data pribadi.",
        content_text:
          "Pengendali data wajib:\n1. Memiliki dasar hukum pemrosesan yang sah\n2. Menerapkan prinsip minimalisasi data\n3. Menjaga keamanan data dengan standar tinggi\n4. Melaporkan kebocoran data dalam 3x24 jam\n5. Menunjuk Data Protection Officer (DPO) jika dibutuhkan",
      },
      {
        // live_class_exam → Zoom live class + Google Form ujian
        workshop_id: ws2.id,
        title: "Menyusun Privacy Policy yang Compliant",
        type: "live_class_exam",
        order: 4,
        schedule_at: new Date("2026-03-16"),
        zoom_url: "https://zoom.us/j/pdp-liveclass-4",
        exam_form_url: "https://forms.google.com/example-privacy-policy",
        description:
          "Praktik langsung menyusun kebijakan privasi yang memenuhi standar UU PDP.",
        content_text:
          "Workshop praktis — peserta akan:\n\n1. Menganalisis contoh privacy policy yang ada\n2. Mengidentifikasi kelemahan dan pelanggaran\n3. Menyusun privacy policy dari scratch\n4. Review dan feedback dari instruktur\n\nTemplate privacy policy akan disediakan.",
      },
      {
        // video_exam → YouTube + Google Form ujian
        workshop_id: ws2.id,
        title: "Studi Kasus: GDPR vs UU PDP & Ujian Akhir",
        type: "video_exam",
        order: 5,
        schedule_at: new Date("2026-03-18"),
        youtube_url: "https://www.youtube.com/watch?v=60ItHLz5WEA",
        exam_form_url: "https://forms.google.com/example-final-pdp",
        description:
          "Perbandingan GDPR dengan UU PDP dan ujian akhir untuk mengukur pemahaman komprehensif.",
        content_text:
          "Perbandingan GDPR (Eropa) vs UU PDP (Indonesia):\n\n| Aspek | GDPR | UU PDP |\n|-------|------|--------|\n| Denda | Hingga 4% revenue | Hingga 2% revenue |\n| DPO | Wajib dalam kondisi tertentu | Wajib dalam kondisi tertentu |\n| Transfer lintas batas | Adequacy decision | Persetujuan pemerintah |\n\nSetelah menonton video, kerjakan ujian akhir.",
      },
    ],
  });

  console.log(`✅ Workshop 2: "${ws2.title}" — 5 modules`);

  // ─── Workshop 3: Keamanan Siber untuk Praktisi Hukum ───
  const ws3 = await prismaClient.workshop.create({
    data: {
      title: "Keamanan Siber untuk Praktisi Hukum",
      description:
        "Workshop teknis yang dirancang khusus untuk praktisi hukum agar memahami aspek teknis keamanan siber, digital forensics, dan cara menangani bukti digital di pengadilan.",
      short_description:
        "Pahami aspek teknis keamanan siber, digital forensics, dan penanganan bukti digital.",
      thumbnail:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
      category: "Keamanan Siber",
      benefits: [
        "Mengenal teknik-teknik serangan siber",
        "Memahami digital forensics dasar",
        "Menangani bukti digital di pengadilan",
      ],
      credit_price: 300,
      user_id: seedUser.id,
      price: 300000,
    },
  });

  await prismaClient.workshopModule.createMany({
    data: [
      {
        // video_discussion → YouTube + Zoom diskusi
        workshop_id: ws3.id,
        title: "Pengantar Keamanan Siber untuk Non-Teknis",
        type: "video_discussion",
        order: 1,
        schedule_at: new Date("2026-03-20"),
        youtube_url: "https://www.youtube.com/watch?v=inWWhr5tnEA",
        zoom_url: "https://zoom.us/j/cybersec-diskusi-1",
        description:
          "Penjelasan dasar keamanan siber yang dirancang untuk praktisi hukum tanpa latar belakang teknis.",
        content_text:
          "Materi pengantar:\n\n1. Apa itu keamanan siber?\n2. Jenis-jenis ancaman: malware, phishing, ransomware\n3. Serangan yang umum terjadi di Indonesia\n4. Dampak hukum dari serangan siber\n5. Peran praktisi hukum dalam kasus siber",
      },
      {
        // video_exam → YouTube + Google Form ujian
        workshop_id: ws3.id,
        title: "Digital Forensics: Pengumpulan Bukti Digital",
        type: "video_exam",
        order: 2,
        schedule_at: new Date("2026-03-22"),
        youtube_url: "https://www.youtube.com/watch?v=OPf0YbXqDm0",
        exam_form_url: "https://forms.google.com/example-digital-forensics",
        description:
          "Cara mengumpulkan, mengamankan, dan menyajikan bukti digital yang sah di pengadilan.",
        content_text:
          "Prinsip-prinsip digital forensics:\n\n1. Chain of custody — menjaga integritas bukti\n2. Imaging — membuat salinan forensik\n3. Hashing — memverifikasi keaslian data\n4. Dokumentasi — pencatatan setiap langkah\n5. Presentasi di pengadilan — cara menyajikan bukti digital\n\nTools yang akan dikenalkan: FTK Imager, Autopsy, Wireshark",
      },
      {
        // exam_only → Google Form saja
        workshop_id: ws3.id,
        title: "Ujian Akhir & Sertifikasi",
        type: "exam_only",
        order: 3,
        schedule_at: new Date("2026-03-24"),
        exam_form_url: "https://forms.google.com/example-final-cybersec",
        description:
          "Ujian akhir untuk mendapatkan sertifikat kelulusan workshop Keamanan Siber untuk Praktisi Hukum.",
        content_text:
          "Ujian akhir mencakup seluruh materi modul 1-2.\n\nFormat: 30 soal pilihan ganda + 2 soal essay\nWaktu: 60 menit\nPassing grade: 75%\n\nSertifikat akan diterbitkan dalam 3 hari kerja setelah kelulusan.",
      },
    ],
  });

  console.log(`✅ Workshop 3: "${ws3.title}" — 3 modules`);
  console.log("\n🎉 Workshop seeding completed!");
}

async function main() {
  const pool = new Pool({
    connectionString: envConfig.DATABASE_DIRECT_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await seedWorkshops(prisma);

  await prisma.$disconnect();
  await pool.end();
}

if (require.main === module) {
  main().catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
}
