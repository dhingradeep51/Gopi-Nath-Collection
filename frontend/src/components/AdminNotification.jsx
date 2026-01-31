import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Replace with your actual backend URL (e.g., your Render link)
const socket = io("http://localhost:8080"); 

const AdminNotification = () => {
    useEffect(() => {
        // 1. Join the Admin Room on mount
        socket.emit("join_admin_room");

        // 2. Listen for the 'admin_alert' event defined in your backend utility
        socket.on("admin_alert", (data) => {
            showToast(data);
        });

        // Cleanup on unmount
        return () => {
            socket.off("admin_alert");
        };
    }, []);

    const showToast = (data) => {
        const options = {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        };

        // Match the color/type sent from your backend notificationUtil.js
        switch (data.type) {
            case "NEW_ORDER":
                toast.success(data.message, options);
                break;
            case "RETURN_REQUEST":
                toast.warning(data.message, options);
                break;
            case "CANCEL_REQUEST":
                toast.error(data.message, options);
                break;
            case "INVOICE_ALERT":
                toast.info(data.message, options);
                break;
            default:
                toast(data.message, options);
        }
    };

    return (
        <>
            {/* This container renders the actual popups on the screen */}
            <ToastContainer />
        </>
    );
};

export default AdminNotification;