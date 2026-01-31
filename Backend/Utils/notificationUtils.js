/**
 * notificationUtil.js
 * Centralized utility for Gopi Nath Collection notifications
 */

export const sendNotification = (req, type, data) => {
    // 1. Get the Socket.io instance from the app settings
    const io = req.app.get("io");
    
    if (!io) {
        console.error("❌ Socket.io instance not found in request".bgRed.white);
        return;
    }

    let notificationData = {
        type,
        orderId: data.orderId || "N/A",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
    };

    // 2. Define message and priority colors based on type
    switch (type) {
        case "NEW_ORDER":
            notificationData.message = `📦 New Order Received! ID: ${data.orderId}`;
            notificationData.color = "#28a745"; // Success Green
            break;
        case "RETURN_REQUEST":
            notificationData.message = `🔄 Return Requested for Order: ${data.orderId}`;
            notificationData.color = "#ffc107"; // Warning Yellow
            break;
        case "CANCEL_REQUEST":
            notificationData.message = `❌ Cancel Request for Order: ${data.orderId}`;
            notificationData.color = "#dc3545"; // Error Red
            break;
        case "INVOICE_ALERT":
            notificationData.message = `⚠️ Invoice missing for Delivered Order: ${data.orderId}`;
            notificationData.color = "#17a2b8"; // Info Blue
            break;
        case "USER_ACCOUNT_UPDATE":
            notificationData.message = `👤 User profile or security change: ${data.orderId}`;
            notificationData.color = "#6f42c1"; // Purple
            break;
        default:
            notificationData.message = `🔔 System Notification: ${data.orderId}`;
            notificationData.color = "#D4AF37"; // Gold
    }

    // 3. --- CYBERSECURITY LOGGING ---
    // This logs the event for your records/auditing
    console.log(
        `[AUDIT LOG] [${notificationData.date} ${notificationData.time}] TYPE: ${type} | ORDER_ID: ${notificationData.orderId}`
        .bgWhite.black
    );

    // 4. Emit the event to the admin room only
    io.to("admin-room").emit("admin_alert", notificationData);
};