import { 
  MessageCircle,  
  Plus
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useServer } from '../context/ServerContext';

interface SideBarProps {
  setShowSCmodal: React.Dispatch<React.SetStateAction<boolean>>
}

const Sidebar = ({ setShowSCmodal }: SideBarProps) => {
  // const [activeSection, setActiveSection] = useState('friends');
  // const [hoveredServer, setHoveredServer] = useState<null | string>(null);
//   const [hoveredDM, setHoveredDM] = useState(null);

  const {
    setShowFriends,
    setActiveServer,
    closeDmWindow,
    servers
  } = useChat();

  const {
    fetchRoles,
  } = useServer();

  return (
    <>
    
      {/* Server List */}
      <div className="w-[65px] bg-gray-950 flex flex-col items-center py-3 space-y-2 border-r border-gray-800">
        {/* Home/DM Button */}
        <div 
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 hover:rounded-xl transition-all duration-200 cursor-pointer"
          // onClick={() => setActiveSection('friends')}
          onClick={() => {setActiveServer(null); setShowFriends(true); closeDmWindow();}}
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
            key={server._id}
            className="group relative z-35"
            onClick={() => {setActiveServer(server); fetchRoles(server._id);}}
            // onMouseEnter={() => setHoveredServer(server.id)}
            // onMouseLeave={() => setHoveredServer(null)}
          >
            <div 
              className={`flex items-center justify-center w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 cursor-pointer hover:opacity-80`}
            >
              <img src={server.icon} className="w-12 h-12 rounded-2xl border border-gray-700 z-100" alt={server.name[0]} />
              {/* {server.hasNotification && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">!</span>
                </div>
              )} */}
              {/* Server tooltip */}
            <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {server.name}
            </div>
            </div>
          </div>
        ))}

        {/* Add Server Button */}
        <div className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-800 hover:bg-green-600 hover:rounded-xl transition-all duration-200 cursor-pointer">
          <Plus size={20} className="text-green-400 group-hover:text-white transition-colors duration-200" onClick={() => setShowSCmodal(true)}/>
          <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Add a Server
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;