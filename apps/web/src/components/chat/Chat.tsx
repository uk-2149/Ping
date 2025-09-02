import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Bell,
  UserPlus,
  Search,
  MoreHorizontal
} from 'lucide-react';
import type { User } from '../../types';
import api from '../../lib/api';
import CreateDM from './CreateDM';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const Chat: React.FC<ChatProps> = () => {
  const [hoveredDM, setHoveredDM] = useState<string | null>(null);
  const [dmModal, setDMModal] = useState<boolean>(false);

  const {
    setShowFriends,
    setActiveChat, // Changed from openDmWindow
    closeDmWindow,
    dmFriends,
    showFriends,
    activeChat,
    // Removed chats and loadChatHistory - no longer exist
  } = useChat();

  const {
    user
  } = useAuth();

  useEffect(() => {
    console.log("activeChat changed:", activeChat);
    console.log("dmFriends:", dmFriends);
  }, [activeChat, dmFriends]); // Removed chats from dependency

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-400';
      case 'AWAY': return 'bg-yellow-400';
      case 'DO_NOT_DISTURB': return 'bg-red-400';
      case 'OFFLINE': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Check if a DM friend has an active chat
  const isActiveDM = (dmFriend: any) => {
    if (!activeChat) return false;
    
    // Check if this dm friend is the active chat (since activeChat.id = friend.id)
    return activeChat.id === dmFriend._id;
  };

  // Since we removed chats array, unread count logic needs to be updated
  // For now, we can use activeChat's unread count if it matches this friend
  const getUnreadCount = (dmFriend: User) => {
    if (activeChat && activeChat.id === dmFriend._id) {
      return activeChat.unreadCount || 0;
    }
    // You might want to store unread counts differently or fetch from backend
    return 0;
  };

  // Get last message preview - only available for active chat now
  const getLastMessagePreview = (dmFriend: User) => {
    if (activeChat && activeChat.id === dmFriend._id && activeChat.lastMessage) {
      return activeChat.lastMessage.content.length > 30 
        ? activeChat.lastMessage.content.substring(0, 30) + '...'
        : activeChat.lastMessage.content;
    }
    
    return null;
  };

  const handleDMClick = async (dmFriend: any) => {
    if (!user) {
      console.error("User not found");
      return;
    }
    
    console.log("Clicking DM with:", dmFriend.username);
    
    // Use setActiveChat which handles both creating chat and loading messages
    await setActiveChat(dmFriend);
    
    // Show DM window
    // You might need to add this action to your context if needed
    // For now, assuming the chat window shows when activeChat is set
  };

  return (
    <div className="flex flex-col h-screen w-full sm:w-[300px] bg-[#0b111f]">
      {/* Header */}
      <div className="py-2 px-4 border-b border-gray-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-lg font-semibold">
            <Users className="text-indigo-400" size={20} />
            <span>Ping</span>
          </div>
          <div className="flex space-x-1">
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors duration-150">
              <Bell size={16} className="text-gray-400 hover:text-white" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors duration-150">
              <UserPlus size={16} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-2 pt-4 sm:px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Find or start a conversation"
            className="w-full bg-gray-900 text-gray-300 text-sm px-10 py-2 rounded border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-2 py-4 sm:px-4 w-full">
        <div className="flex space-x-1 justify-between">
          <button 
            className={`px-3 py-1.5 text-md font-medium rounded transition-all duration-200 text-white text-left w-full hover:text-gray-300 hover:bg-gray-700/50 inline-flex gap-3 items-center ${
              showFriends ? 'bg-gray-700' : ''
            }`}
            onClick={() => {
              closeDmWindow(); 
              setShowFriends(!showFriends);
            }}
          >
            <Users size={20} />
            Friends
          </button>
        </div>
      </div>

      {/* Direct Messages Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pb-2 sm:px-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <span>Direct Messages</span>
            <button 
              className="hover:text-gray-300 transition-colors duration-150"
              onClick={() => setDMModal(true)}
            >
              <Plus size={14} />
            </button>
          </div>
          
          {dmFriends && dmFriends.length > 0 ? (
            dmFriends.map((dm) => {
              const unreadCount = getUnreadCount(dm);
              const lastMessage = getLastMessagePreview(dm);
              const isActive = isActiveDM(dm);
              
              return (
                <div 
                  key={dm._id || dm.id} // Use _id as primary, fallback to id
                  className={`group flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    hoveredDM === (dm._id || dm.id) ? 'bg-gray-700' : 'hover:bg-gray-700/70'
                  } ${
                    isActive ? 'bg-gray-700' : ''
                  }`}
                  onMouseEnter={() => setHoveredDM(dm._id || dm.id)}
                  onMouseLeave={() => setHoveredDM(null)}
                  onClick={() => handleDMClick(dm)}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm overflow-hidden">
                      {dm.avatar ? (
                        <img 
                          src={dm.avatar} 
                          className='w-8 h-8 rounded-full object-cover' 
                          alt={dm.username} 
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {dm.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(dm.status)}`}></div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200 truncate">
                        {dm.username}
                      </span>
                      {dm.isOfficial && (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-indigo-500 rounded-sm flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                          <span className="text-xs text-indigo-400 font-medium">OFFICIAL</span>
                        </div>
                      )}
                    </div>
                    {lastMessage ? (
                      <p className="text-xs text-gray-500 truncate">{lastMessage}</p>
                    ) : dm.activity ? (
                      <p className="text-xs text-gray-500 truncate">{dm.activity}</p>
                    ) : (
                      <p className="text-xs text-gray-500 truncate">No messages yet</p>
                    )}
                  </div>
                  <button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-600 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add context menu logic here
                    }}
                  >
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No direct messages yet</p>
              <p className="text-gray-600 text-xs mt-1">Start a conversation with your friends!</p>
            </div>
          )}
        </div>
      </div>

      {dmModal && (
        <CreateDM 
          setDMModal={setDMModal}
        />
      )}
    </div>
  );
}; 

export default Chat;