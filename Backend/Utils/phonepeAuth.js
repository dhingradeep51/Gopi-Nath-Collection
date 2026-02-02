import axios from "axios";

/**
 * Generates an OAuth2 Access Token for PhonePe V2 Integration
 * Documentation: https://api.phonepe.com/apis/identity-manager/v1/token
 */
export const getPhonePeV2Token = async () => {
  try {
    // V2 credentials must be passed as urlencoded data
    const data = new URLSearchParams();
    data.append("client_id", process.env.PHONEPE_CLIENT_ID);
    data.append("client_secret", process.env.PHONEPE_CLIENT_SECRET);
    data.append("grant_type", "client_credentials");

    // The endpoint varies by environment (Sandbox vs Production)
    // Sandbox: https://api-preprod.phonepe.com/apis/identity-manager/v1/token
    // Production: https://api.phonepe.com/apis/identity-manager/v1/token
    const authEndpoint = process.env.NODE_ENV === "production" 
      ? "https://api.phonepe.com/apis/identity-manager/v1/token"
      : "https://api-preprod.phonepe.com/apis/identity-manager/v1/token";

    const response = await axios.post(authEndpoint, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // Required for Token API
      },
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error("Access token missing in PhonePe response");
    }
  } catch (error) {
    console.error("PhonePe Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with PhonePe V2 API");
  }
};