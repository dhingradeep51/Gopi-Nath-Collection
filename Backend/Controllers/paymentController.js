import axios from "axios";
import { getPhonePeAccessToken } from "../Utils/phonepeAuth.js";

// ✅ V2 BASE URL (NO pgsandbox)
const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis";

export const checkStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;

    // 🔑 Fetch OAuth token
    const accessToken = await getPhonePeAccessToken();

    // 🔍 Call V2 status API
    const response = await axios.get(
      `${PHONEPE_BASE_URL}/pg/v2/status/${merchantTransactionId}`,
      {
        headers: {
          Authorization: `O-Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (
      response.data?.success === true &&
      response.data?.data?.state === "COMPLETED"
    ) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/user/orders?success=true`
      );
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`
    );

  } catch (error) {
    console.error("PhonePe V2 Status Error:", error.response?.data || error.message);

    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`
    );
  }
};
