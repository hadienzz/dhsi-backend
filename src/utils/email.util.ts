import nodemailer from "nodemailer";
import { envConfig } from "../config/load-env";

const transporter = nodemailer.createTransport({
  host: envConfig.SMTP_HOST,
  port: envConfig.SMTP_PORT,
  secure: false,
  auth: {
    user: envConfig.SMTP_USER,
    pass: envConfig.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (
  to: string,
  code: string,
): Promise<void> => {
  await transporter.sendMail({
    from: envConfig.SMTP_FROM,
    to,
    subject: "Kode Verifikasi DHSI",
    text: `Kode verifikasi Anda: ${code}\n\nKode ini berlaku selama 10 menit.\nJika Anda tidak meminta kode ini, abaikan email ini.`,
  });
};
