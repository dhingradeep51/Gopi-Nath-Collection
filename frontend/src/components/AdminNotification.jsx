import { useEffect } from 'react';
import { io } from 'socket.io-client';

// Change this to your deployed backend URL for production
const socket = io("https://gopi-nath-collection.onrender.com/"); 

const AdminNotification = ({ setUnreadCount, role }) => {
    useEffect(() => {
        if (role === 1) {
            socket.emit("join_admin_room");

            socket.on("admin_alert", (data) => {
                // This updates the red badge in your AdminMenu
                setUnreadCount((prev) => prev + 1);
            });
        }
        return () => socket.off("admin_alert");
    }, [role, setUnreadCount]);

    return null; 
};

export default AdminNotification; // This line is vital for the import to work