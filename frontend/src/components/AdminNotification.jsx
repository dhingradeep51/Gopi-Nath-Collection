import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const socket = io("https://gopi-nath-collection.onrender.com/"); 

const AdminNotification = ({ setUnreadCount, role }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 1) {
            socket.emit("join_admin_room");

            socket.on("admin_alert", (data) => {
                // 1. Update the bubble count for the bell
                setUnreadCount(prev => prev + 1);

                // 2. ✅ SAVE TO LOCALSTORAGE
                try {
                    const existingLogs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
                    const updatedLogs = [data, ...existingLogs].slice(0, 50); 
                    localStorage.setItem("admin_notifications", JSON.stringify(updatedLogs));
                    
                    // ✅ This "dispatches" an event so the Notification Page updates instantly
                    window.dispatchEvent(new Event("storage"));
                } catch (err) {
                    console.error("❌ Storage Error:", err);
                }

                // 3. Show the Toast
                toast.info(data.message, {
                    position: "bottom-right",
                    autoClose: 5000,
                    theme: "dark",
                    onClick: () => {
                        navigate(`/dashboard/admin/orders`);
                        setUnreadCount(0);
                    }
                });
            });
        }

        return () => socket.off("admin_alert");
    }, [role, navigate, setUnreadCount]);

    return null; 
};

export default AdminNotification;