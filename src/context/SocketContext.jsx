import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { addToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        // Listen for admin notifications
        newSocket.on('admin_notification', (notification) => {
            console.log('Received notification:', notification);

            // Only show toast if current user is admin
            if (user?.role === 'admin') {
                const { type, data } = notification;

                if (type === 'new_order') {
                    addToast(`New Order from ${data.customer}: ₹${data.amount}`, 'success');
                    // Optional: Play a sound
                    try { new Audio('/notification.mp3').play(); } catch (e) { }
                } else if (type === 'new_user') {
                    addToast(`New User Signup: ${data.name}`, 'info');
                }
            }
        });

        return () => newSocket.close();
    }, [user, addToast]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
