import axios from "axios";

export const getPhonePeAccessToken = async () => {
  const response = await axios.post(
    `${process.env.PHONEPE_ENV === "LIVE"
      ? "https://api.phonepe.com/apis/oauth2/token"
      : "https://api-preprod.phonepe.com/apis/oauth2/token"}`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.PHONEPE_CLIENT_ID,
      client_secret: process.env.PHONEPE_CLIENT_SECRET,
      client_version: process.env.PHONEPE_CLIENT_VERSION
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return response.data.access_token;
};
