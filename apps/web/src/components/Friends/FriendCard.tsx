import {  
  MessageCircle, 
  MoreHorizontal
} from 'lucide-react';


interface Friend {
  id: number;
  username: string;
  discriminator: string;
  avatar: string;
  status: string;
  lastSeen: string;
  activity: string | null;
  mutual: number;
}

const FriendCard = ({ friend, hoveredFriend, setHoveredFriend, getStatusColor }: {
  friend: Friend;
  hoveredFriend: number | null;
  setHoveredFriend: (id: number | null) => void;
  getStatusColor: (status: string) => string;
}) => (
  <div
    className={`group flex items-center justify-between p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 ${
      hoveredFriend === friend.id ? 'bg-gray-600/30' : 'bg-gray-800/50 hover:bg-gray-600/20'
    }`}
    onMouseEnter={() => setHoveredFriend(friend.id)}
    onMouseLeave={() => setHoveredFriend(null)}
  >
    <div className="flex items-center space-x-4 flex-1">
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg">
          <img src={friend.avatar} className="w-10 h-10 rounded-full" alt={friend.username} />
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(friend.status)}`}></div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white group-hover:text-white transition-colors duration-200">
            {friend.username}
          </span>
          <span className="text-gray-400 text-sm">
            {/* {friend.discriminator} */}
          </span>
        </div>
        
        {friend.activity ? (
          <p className="text-sm text-indigo-400 truncate">
            {/* {friend.activity} */} Activity
          </p>
        ) : (
          <p className="text-sm text-gray-500 truncate">
            {/* {friend.lastSeen} */} last seen
          </p>
        )}
        
        {friend.mutual > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {/* {friend.mutual} mutual server{friend.mutual !== 1 ? 's' : ''} */} mutual server
          </p>
        )}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button 
        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200"
        title="Send Message"
      >
        <MessageCircle size={16} className="text-gray-300 hover:text-white" />
      </button>
      <button 
        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200"
        title="More Options"
      >
        <MoreHorizontal size={16} className="text-gray-300 hover:text-white" />
      </button>
    </div>
  </div>
);

export default FriendCard;