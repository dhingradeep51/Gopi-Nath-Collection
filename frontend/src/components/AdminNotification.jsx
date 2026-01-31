import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const socket = io("https://gopi-nath-collection.onrender.com/"); 

const AdminNotification = ({ setUnreadCount, role }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Only run for Admin role (role === 1)
        if (role === 1) {
            socket.emit("join_admin_room");

            socket.on("admin_alert", (data) => {
                // 1. Update the bubble count in the menu
                setUnreadCount(prev => prev + 1);

                // 2. ✅ SAVE TO LOCALSTORAGE (This makes the data show on your Registry Page)
                try {
                    const existingLogs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
                    // Add new data to the top of the array
                    const updatedLogs = [data, ...existingLogs].slice(0, 50); // Keep last 50 alerts
                    localStorage.setItem("admin_notifications", JSON.stringify(updatedLogs));
                } catch (error) {
                    console.error("Error saving notification to storage:", error);
                }

                // 3. Configure the Toast appearance
                toast.info(data.message, {
                    position: "bottom-right",
                    autoClose: 5000, 
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    onClick: () => {
                        // Clicking the toast still takes you to orders
                        navigate(`/dashboard/admin/orders`);
                        setUnreadCount(0);
                    }
                });
            });
        }

        // Cleanup on unmount
        return () => {
            socket.off("admin_alert");
        };
    }, [role, navigate, setUnreadCount]);

    return null; 
};

export default AdminNotification;