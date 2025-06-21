'use client';
import { useEffect, useState } from 'react';
import { useSocket } from '../_context/SocketContext';
import { useAuth } from '../_context/AuthContext'; // Import useAuth

export default function PresenceIndicator({ activeUsers, currentUserId }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useSocket();
  const { users } = useAuth(); // Get users directly from auth context

  useEffect(() => {
    if (!socket) return;

    const handleUserPresence = ({ userId, isActive }) => {
      setOnlineUsers(prev => 
        isActive 
          ? [...prev.filter(id => id !== userId), userId]
          : prev.filter(id => id !== userId)
      );
    };

    socket.on('user-presence-update', handleUserPresence);

    return () => {
      socket.off('user-presence-update', handleUserPresence);
    };
  }, [socket]);

  // Get unique user IDs (combining activeUsers and onlineUsers)
  const uniqueUserIds = [...new Set([...activeUsers, ...onlineUsers])]
    .filter(id => id !== currentUserId);

  return (
    <div className="flex items-center gap-2">
      {uniqueUserIds.map(userId => {
        // Find the user in the users array from auth context
        const user = users?.find(u => u._id === userId);
        const displayName = user?.name || userId.substring(0, 2);
        
        return (
          <div 
            key={userId} 
            className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs"
            title={user?.name || userId} // Show full name or ID on hover
          >
            {displayName.substring(0, 2).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}