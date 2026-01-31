const { io } = require("../server");

const sendAdminNotification = (type, orderId) => {
  let message = "";

  switch (type) {
    case "NEW_ORDER":
      message = `📦 Order Received! ID: ${orderId}`;
      break;
    case "RETURN_REQUEST":
      message = `🔄 Return Requested for ID: ${orderId}`;
      break;
    case "CANCEL_REQUEST":
      message = `❌ Cancellation Request: ${orderId}`;
      break;
    case "INVOICE_ALERT":
      message = `⚠️ Invoice missing for Delivered Order: ${orderId}`;
      break;
    default:
      message = `🔔 System Alert: ${orderId}`;
  }

  // Send to the entire admin room
  io.to("admin-room").emit("admin_alert", {
    type,
    message,
    orderId,
    time: new Date().toLocaleTimeString()
  });
};

module.exports = { sendAdminNotification };