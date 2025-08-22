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

interface ChatProps {
  setShowFriends: React.Dispatch<React.SetStateAction<boolean>>;
  setDmWindow: React.Dispatch<React.SetStateAction<boolean>>
  setDmFriends: React.Dispatch<React.SetStateAction<any[]>>
  dmFriends: any[]
}

const Chat: React.FC<ChatProps> = ({ setShowFriends, setDmWindow, setDmFriends, dmFriends }) => {
  // const [activeSection, setActiveSection] = useState('friends');
  const [hoveredDM, setHoveredDM] = useState<null | number>(null);
  const [dmModal, setDMModal] = useState<boolean>(false);
  const [friends, setFriends] = useState<any[]>([]);


  useEffect(() => {
    const fetchFriendLists = async () => {
      try {
        const res = await api.get("/api/users/getFriends");
        setFriends(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchFriendLists();
  }, []);

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-400';
      case 'AWAY': return 'bg-yellow-400';
      case 'DO_NOT_DISTURB': return 'bg-red-400';
      case 'OFFLINE': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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
              className={`px-3 py-1.5 text-md font-medium rounded transition-all duration-200 bg-gray-700 text-white text-left w-full hover:text-gray-300 hover:bg-gray-700/50 inline-flex gap-3 items-center`}
              onClick={() => {setShowFriends(true); setDmWindow(false)}}
              //   ${
              //   activeSection === 'friends' 
              //     ? 'bg-gray-700 text-white' 
              //     : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              // }`}
              // onClick={() => setActiveSection('friends')}
            >
              <Users size={20} />
              Friends
            </button>
            {/* <button 
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-200`}
              //   ${
              //   activeSection === 'all' 
              //     ? 'bg-gray-700 text-white' 
              //     : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              // }`}
              // onClick={() => setActiveSection('all')}
            >
              All
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200">
              Add Friend
            </button> */}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 pb-2 sm:px-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <span>Direct Messages</span>
              <button className="hover:text-gray-300 transition-colors duration-150"
              onClick={() => setDMModal(true)}>
                <Plus size={14} />
              </button>
            </div>
            
            {dmFriends.map((dm) => (
              <div 
                key={dm.id}
                className={`group flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200 z-100 ${
                  hoveredDM === dm.id ? 'bg-gray-700' : 'hover:bg-gray-700/70'
                }`}
                onMouseEnter={() => setHoveredDM(dm.id)}
                onMouseLeave={() => setHoveredDM(null)}
                onClick={() => {setShowFriends(false); setDmWindow(true);}}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm z-10">
                    <img src={dm.avatar} className='w-8 h-8 rounded-full' alt={dm.username[0]} />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(dm.status)}`}></div>
                  {dm.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">1</span>
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
                  {dm.activity && (
                    <p className="text-xs text-gray-500 truncate">{dm.activity}</p>
                  )}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-600 rounded">
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {dmModal && <CreateDM setDMModal={setDMModal} friends={friends} onCreateDM={setDmFriends} setDMwindow={setDmWindow} setShowFriends={setShowFriends}/>}
        
        </div>
  )
} 

export default Chat;