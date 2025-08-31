import Sidebar from '../components/SideBar';
import { useState } from 'react'
// import { servers } from '../types/index';
import Chat from '../components/chat/Chat';
import ProfileBar from '../components/ProfileBar';
import Friends from '../components/Friends/Friends';
import api from '../lib/api';
import UsernameModal from '../components/Username';
import DmChatWindow from '../components/chat/ChatWindow';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { FriendsProvider } from '../context/FriendsContext';

function Home() {
  const [dmFriends, setDmFriends] = useState<any[]>([]);

  const {
    usernameSet,
    showFriends,
    activeServer,
    showDmWindow
  } = useChat();

  const {
    user
  } = useAuth();

  const onSubmit = async(username: string) => {
    const res = await api.post("/api/users/setUsername", { username });
    // setUsernameSet(false);
    console.log(res.data);
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        <ProfileBar username={user.username} avatar={user.avatar}/>
        <Sidebar />
        {activeServer == 0 && <Chat setDmFriends={setDmFriends} dmFriends={dmFriends}/>}
        {showFriends && <FriendsProvider><Friends /></FriendsProvider>}
        {usernameSet && <UsernameModal onSubmit={onSubmit}/>}
        {showDmWindow && <DmChatWindow />}
    </div>
  )
}

export default Home