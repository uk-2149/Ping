import { useState } from 'react';
import { 
  Users, 
  Search, 
  MessageCircle, 
  MoreHorizontal, 
  UserPlus,
  Bell,
  Hash,
} from 'lucide-react';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredFriend, setHoveredFriend] = useState<null | number>(null);

  //mock data
  const friends = [
    {
      id: 1,
      username: '4bhinyash',
      discriminator: '#0001',
      avatar: '👨',
      status: 'ONLINE',
      lastSeen: 'Online',
      activity: null,
      mutual: 3
    },
    {
      id: 2,
      username: 'noone_6954',
      discriminator: '#6954',
      avatar: '🐺',
      status: 'AWAY',
      lastSeen: 'Last seen yesterday',
      activity: null,
      mutual: 1
    },
    {
      id: 3,
      username: 'Nova',
      discriminator: '#7890',
      avatar: '⭐',
      status: 'DO_NOT_DISTURB',
      lastSeen: 'Last seen 3 days ago',
      activity: null,
      mutual: 5
    }
  ];

  const onlineFriends = friends.filter(f => f.status === 'ONLINE');
  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
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
    { name: 'Pending', count: 0 },
    { name: 'Blocked', count: 0 }
  ];

  return (
    <div className="flex-1 bg-[#121929] text-white">
      {/* Header */}
      <div className="h-12 bg-[#262e3b] border-b border-gray-600 flex items-center justify-between px-4 shadow-sm">
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
                onClick={() => setActiveTab(tab.name)}
                className={`px-2 py-1 text-sm font-medium rounded transition-all duration-200 ${
                  activeTab === tab.name
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
          
          <button className="px-3 py-1 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-500 transition-colors duration-200 flex items-center space-x-1">
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

      {/* Content Area */}
      <div className="flex-1">
        <div className="px-6 py-4">
          {/* Friends List Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {activeTab} — {tabs.find((tab) => tab.name === activeTab)?.count}
            </h3>
          </div>

          {/* Friends List */}
          <div className="space-y-2">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
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
                        {friend.avatar}
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
                          {friend.discriminator}
                        </span>
                      </div>
                      
                      {friend.activity ? (
                        <p className="text-sm text-indigo-400 truncate">
                          {friend.activity}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 truncate">
                          {friend.lastSeen}
                        </p>
                      )}
                      
                      {friend.mutual > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {friend.mutual} mutual server{friend.mutual !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200 tooltip-container"
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
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">
                  {searchTerm ? 'No friends match your search.' : 'No friends to display.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Active Now
        <div className="fixed right-0 top-12 bottom-0 w-80 bg-gray-800 border-l border-gray-600 p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Active Now</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">It's quiet for now...</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                When a friend starts an activity — like playing a game or hanging out on voice — we'll show it here!
              </p>
            </div>
          </div>
        </div> */}
      </div> 
    </div>
  );
};

export default Friends;