import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// ✅ ADD THE HEARTBEAT CONFIGURATION HERE
const socket = io("https://gopi-nath-collection.onrender.com/", {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
});

const AdminNotification = ({ setUnreadCount, role }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 1) {
            // Re-join the room whenever the component mounts or reconnects
            socket.emit("join_admin_room");

            socket.on("admin_alert", (data) => {
                setUnreadCount(prev => prev + 1);

                try {
                    const existingLogs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
                    const updatedLogs = [data, ...existingLogs].slice(0, 50); 
                    localStorage.setItem("admin_notifications", JSON.stringify(updatedLogs));
                    
                    // Sync the Registry Page
                    window.dispatchEvent(new Event("storage"));
                } catch (err) {
                    console.error("Storage Error:", err);
                }

                toast.info(data.message, {
                    position: "bottom-right",
                    autoClose: 5000,
                    theme: "dark",
                });
            });
        }

        // Handle Reconnection Events
        socket.on("connect", () => {
            console.log("✅ Connected to Socket Server");
            if (role === 1) socket.emit("join_admin_room");
        });

        socket.on("disconnect", () => {
            console.log("❌ Disconnected from Socket Server");
        });

        return () => {
            socket.off("admin_alert");
            socket.off("connect");
            socket.off("disconnect");
        };
    }, [role, setUnreadCount]);

    return null; 
};

export default AdminNotification;