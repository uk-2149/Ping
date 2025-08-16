import { useState } from 'react';
import { 
  MessageCircle,  
  Plus
} from 'lucide-react';
import { servers } from '../types/index';

interface SideBarProps {
  setActiveServer: React.Dispatch<React.SetStateAction<number | null>>;
  setShowFriends: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SideBarProps> = ({ setActiveServer, setShowFriends }) => {
  // const [activeSection, setActiveSection] = useState('friends');
  const [hoveredServer, setHoveredServer] = useState<null | number>(null);
//   const [hoveredDM, setHoveredDM] = useState(null);

  // const servers = [
  //   { id: 1, name: 'Gaming Hub', icon: '🎮', hasNotification: true, color: 'bg-blue-500' },
  //   { id: 2, name: 'Dev Community', icon: '💻', hasNotification: false, color: 'bg-green-500' },
  //   { id: 3, name: 'Art Studio', icon: '🎨', hasNotification: true, color: 'bg-purple-500' },
  //   { id: 4, name: 'Music Lounge', icon: '🎵', hasNotification: false, color: 'bg-pink-500' },
  //   { id: 5, name: 'Study Group', icon: '📚', hasNotification: true, color: 'bg-yellow-500' },
  // ];

//   const directMessages = [
//     { id: 1, username: 'noone_6954', avatar: '🐺', status: 'online', hasNotification: false },
//     { id: 2, username: 'chandu', avatar: '👤', status: 'idle', hasNotification: true },
//     { id: 3, username: 'Discord', avatar: '🤖', status: 'online', hasNotification: false, isOfficial: true },
//     { id: 4, username: 'Deepanshu', avatar: '🧑', status: 'dnd', hasNotification: false },
//     { id: 5, username: 'Abhinyash', avatar: '👨', status: 'offline', hasNotification: true },
//     { id: 6, username: 'Nova', avatar: '⭐', status: 'online', hasNotification: false },
//     { id: 7, username: 'Discortics', avatar: '🔮', status: 'online', hasNotification: false },
//     { id: 8, username: 'Carl-bot', avatar: '🤖', status: 'online', hasNotification: false, activity: 'Playing /games | carl.gg' },
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'online': return 'bg-green-400';
//       case 'idle': return 'bg-yellow-400';
//       case 'dnd': return 'bg-red-400';
//       case 'offline': return 'bg-gray-500';
//       default: return 'bg-gray-500';
//     }
//   };

  return (
    <>
    
      {/* Server List */}
      <div className="w-16 bg-gray-950 flex flex-col items-center py-3 space-y-2 border-r border-gray-800">
        {/* Home/DM Button */}
        <div 
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 hover:rounded-xl transition-all duration-200 cursor-pointer"
          // onClick={() => setActiveSection('friends')}
          onClick={() => {setActiveServer(0); setShowFriends(true)}}
        >
          <MessageCircle size={20} className="text-white" />
          <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Direct Messages
          </div>
        </div>

        {/* Divider */}
        <div className="w-8 h-0.5 bg-gray-700 rounded-full my-2"></div>

        {/* Server Icons */}
        {servers.map((server) => (
          <div 
            key={server.id}
            className="group relative z-100"
            onClick={() => setActiveServer(server.id)}
            onMouseEnter={() => setHoveredServer(server.id)}
            onMouseLeave={() => setHoveredServer(null)}
          >
            <div 
              className={`flex items-center justify-center w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 cursor-pointer ${server.color} hover:opacity-80`}
            >
              <span className="text-xl">{server.icon}</span>
              {server.hasNotification && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">!</span>
                </div>
              )}
              {/* Server tooltip */}
            <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {server.name}
            </div>
            </div>
          </div>
        ))}

        {/* Add Server Button */}
        <div className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-800 hover:bg-green-600 hover:rounded-xl transition-all duration-200 cursor-pointer">
          <Plus size={20} className="text-green-400 group-hover:text-white transition-colors duration-200" />
          <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Add a Server
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;