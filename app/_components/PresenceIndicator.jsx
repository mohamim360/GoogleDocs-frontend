'use client';
import { useEffect, useState } from 'react';
import { useSocket } from '../_context/SocketContext';

export default function PresenceIndicator({ activeUsers, currentUserId }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useSocket();

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

  return (
    <div className="flex items-center gap-2">
      {[...activeUsers, ...onlineUsers]
        .filter((id, index, self) => id !== currentUserId && self.indexOf(id) === index)
        .map(userId => (
          <div key={userId} className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
            {userId.substring(0, 2)}
          </div>
        ))}
    </div>
  );
}