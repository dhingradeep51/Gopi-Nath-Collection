import { StandardCheckoutClient, Env } from "pg-sdk-node";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

const phonePeClient = new StandardCheckoutClient(
  process.env.PHONEPE_CLIENT_ID,
  process.env.PHONEPE_CLIENT_SECRET,
  process.env.PHONEPE_CLIENT_VERSION || "1",
  env,
  false // shouldPublishEvents
);

export default phonePeClient;