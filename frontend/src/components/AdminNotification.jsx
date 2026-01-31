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
                // Update the bubble count in the menu
                setUnreadCount(prev => prev + 1);

                // Configure the Toast appearance
                toast.info(data.message, {
                    position: "bottom-right",
                    autoClose: 5000, // ✅ 5000ms = 5 Seconds
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    // When clicked, navigate to orders and reset count
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