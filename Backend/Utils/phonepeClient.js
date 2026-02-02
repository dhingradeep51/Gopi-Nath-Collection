import { StandardCheckoutClient, Env } from "phonepe-pg-sdk";

const env =
  process.env.PHONEPE_ENV === "PRODUCTION"
    ? Env.PRODUCTION
    : Env.SANDBOX;

export const phonePeClient = StandardCheckoutClient.getInstance(
  process.env.PHONEPE_CLIENT_ID,
  process.env.PHONEPE_CLIENT_SECRET,
  Number(process.env.PHONEPE_CLIENT_VERSION || 1),
  env
);