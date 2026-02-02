// pages/PaymentProcessing.jsx
import { useParams } from "react-router-dom";

const PaymentProcessing = () => {
  const { orderNumber } = useParams();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Processing your payment…</h2>
      <p>Order: {orderNumber}</p>
      <p>Please do not refresh this page.</p>
    </div>
  );
};

export default PaymentProcessing;
