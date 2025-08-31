import { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus,
  Bell,
  Hash,
  UserX,
  Clock
} from 'lucide-react';
import FriendRequest from './FriendRequest';
import FriendCard from './FriendCard';
import PendingReceivedRequestCard from './PendingReceivedRequest';
import EmptyState from './EmptyState';
import { useFriends } from '../../context/FriendsContext';

// Helper types
export interface Friend {
  id: number;
  username: string;
  discriminator: string;
  avatar: string;
  status: string;
  lastSeen: string;
  activity: string | null;
  mutual: number;
}

const FriendsMainContent = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredFriend, setHoveredFriend] = useState<number | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  // const [ReceivedRequests, setReceivedRequests] = useState<any[]>([]);
  // const [friends, setFriends] = useState<any[]>([]);

  const {
    friends,
    receivedRequests
  } = useFriends();

  // Callback function to remove a request from the UI
// const handleRequestUpdate = (requestId: string) => {
//   setReceivedRequests(prev => 
//     prev.filter(request => request._id !== requestId)
//   );
// };

  //  useEffect(() => {
  //   const fetchFriendRequests = async () => {
  //     try {
  //       const res = await api.get("/api/users/getReceivedRequests");
  //       setReceivedRequests(res.data);
  //     } catch (error) {
  //       console.error("Error fetching requests:", error);
  //     }
  //   };
  //   fetchFriendRequests();
  // }, []);

  // useEffect(() => {
  //   const fetchFriendLists = async () => {
  //     try {
  //       const res = await api.get("/api/users/getFriends");
  //       setFriends(res.data);
  //     } catch (error) {
  //       console.error("Error fetching requests:", error);
  //     }
  //   };
  //   fetchFriendLists();
  // }, []);

  const getFilteredFriends = () => {
    let filtered = friends;
    
    // Filter by tab
    switch (activeTab) {
      case 'Online':
        filtered = friends.filter(f => f.status === 'ONLINE' || f.status === 'AWAY' || f.status === 'DO_NOT_DISTURB');
        break;
      case 'All':
        filtered = friends;
        break;
      case 'Pending':
        return receivedRequests;
      case 'Blocked':
        return [];
      default:
        filtered = friends;
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(friend => 
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredFriends = getFilteredFriends();
  const onlineFriends = friends.filter(f => f.status === 'ONLINE' || f.status === 'AWAY' || f.status === 'DO_NOT_DISTURB');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-400';
      case 'AWAY': return 'bg-yellow-400';
      case 'DO_NOT_DISTURB': return 'bg-red-400';
      case 'OFFLINE': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const tabs = [
    { name: 'Online', count: onlineFriends.length },
    { name: 'All', count: friends.length },
    { name: 'Pending', count: receivedRequests.length },
    { name: 'Blocked', count: 0 }
  ];

  return (
    <div className="flex-1 bg-[#121929] text-white">
      {/* Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-600 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="text-gray-400" size={20} />
            <span className="text-white font-semibold">Friends</span>
          </div>
          
          <div className="h-6 w-px bg-gray-600"></div>
          
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setShowAddFriend(false);
                }}
                className={`px-2 py-1 text-sm font-medium rounded transition-all duration-200 ${
                  activeTab === tab.name && !showAddFriend
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-1 text-xs text-gray-400">- {tab.count}</span>
                )}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => {
              setShowAddFriend(true);
              setActiveTab('');
            }}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 flex items-center space-x-1 ${
              showAddFriend 
                ? 'bg-green-700 text-white'
                : 'bg-green-600 text-white hover:bg-green-500'
            }`}
          >
            <UserPlus size={14} />
            <span>Add Friend</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-1.5 hover:bg-gray-600 rounded transition-colors duration-200">
            <Bell size={16} className="text-gray-400 hover:text-white" />
          </button>
          <button className="p-1.5 hover:bg-gray-600 rounded transition-colors duration-200">
            <Hash size={16} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {!showAddFriend && (
        <div className="px-6 py-4 border-b border-gray-600">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-gray-300 text-sm px-10 py-2.5 rounded border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 placeholder-gray-500"
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1">
        {showAddFriend ? (
          <FriendRequest />
        ) : (
          <div className="px-6 py-4">
            {/* Friends List Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {activeTab} — {filteredFriends.length}
              </h3>
            </div>

            {/* Content based on active tab */}
            <div className="space-y-2">
              {activeTab === 'Blocked' ? (
                <EmptyState 
                  icon={<UserX size={48} />} 
                  title="No blocked users" 
                  description="When you block someone, they'll appear here." 
                />
              ) : activeTab === 'Pending' && filteredFriends.length === 0 ? (
                <EmptyState 
                  icon={<Clock size={48} />} 
                  title="No pending friend requests" 
                  description="Here's where you'll see friend requests waiting for your response." 
                />
              ) : activeTab === 'Pending' ? (
                // Render pending requests only
                (filteredFriends).map((request) => (
                  <PendingReceivedRequestCard key={request.sender} request={request} />
                ))
              ) : filteredFriends.length > 0 ? (
                // Render friends only
                (filteredFriends as Friend[]).map((friend) => (
                  <FriendCard 
                    key={friend.id} 
                    friend={friend} 
                    hoveredFriend={hoveredFriend}
                    setHoveredFriend={setHoveredFriend}
                    getStatusColor={getStatusColor}
                  />
                ))
              ) : (
                <EmptyState 
                  icon={<Users size={48} />} 
                  title={searchTerm ? 'No friends match your search' : `No ${activeTab.toLowerCase()} friends`} 
                  description={searchTerm ? 'Try a different search term.' : `You don't have any ${activeTab.toLowerCase()} friends right now.`} 
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsMainContent;