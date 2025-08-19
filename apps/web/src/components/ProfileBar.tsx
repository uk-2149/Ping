import { 
  Settings, 
  Mic, 
  Headphones
} from 'lucide-react';

interface ProfileBarProps {
  username: string;
  avatar: string;
}

const ProfileBar: React.FC<ProfileBarProps> = ({ username, avatar }) => {
  return (
    <div>
        <div className="p-3 bg-gray-900 border-t border-gray-700 absolute bottom-3 left-1/2 md:left-3 transform -translate-x-1/2 md:translate-x-0 rounded-lg w-[95%] md:w-[320px] flex justify-center md:justify-start">
          <div className="flex justify-between w-full">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                <img src={avatar} className="w-10 h-10 rounded-full" alt={username[0]} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="flex-1 min-w-0 ml-3">
              <p className="text-sm font-semibold text-white truncate">{username}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            <div className="flex space-x-1">
              <button className="p-2 hover:bg-gray-700 rounded transition-colors duration-200">
                <Mic size={16} className="text-gray-400 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded transition-colors duration-200">
                <Headphones size={16} className="text-gray-400 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded transition-colors duration-200">
                <Settings size={16} className="text-gray-400 hover:text-white" />
              </button>
            </div>
            </div>
            </div>
    </div>
  )
}

export default ProfileBar