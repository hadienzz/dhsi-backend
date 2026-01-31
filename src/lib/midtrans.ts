import midtransClient from "midtrans-client";
import { envConfig } from "../config/load-env";

export const snap = new midtransClient.Snap({
  isProduction: false, // sandbox
  serverKey: envConfig.MIDTRANS_SERVER_KEY as string,
  clientKey: envConfig.MIDTRANS_CLIENT_KEY as string,
});
