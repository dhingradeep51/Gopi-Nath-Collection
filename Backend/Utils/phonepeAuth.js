import axios from "axios";

export const getPhonePeV2Token = async () => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.PHONEPE_CLIENT_ID);
  params.append("client_secret", process.env.PHONEPE_CLIENT_SECRET);
  params.append("grant_type", "client_credentials");

  const response = await axios.post(
    "https://api-preprod.phonepe.com/apis/identity-manager/v1/token", 
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } } // CRITICAL
  );
  return response.data.access_token;
};