import Sidebar from '../components/SideBar';
import { use, useEffect, useState } from 'react'
// import { servers } from '../types/index';
import Chat from '../components/chat/Chat';
import ProfileBar from '../components/ProfileBar';
import Friends from '../components/Friends/Friends';
import api from '../lib/api';
import UsernameModal from '../components/Username';
import DmChatWindow from '../components/chat/ChatWindow';
import { ChatProvider, useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { FriendsProvider } from '../context/FriendsContext';

function Home() {

  const {
    usernameSet,
    showFriends,
    activeServer,
    showDmWindow
  } = useChat();

  const {
    user
  } = useAuth();

  // useEffect(() => {
  //   checkUsername();
  //   console.log((usernameSet === "not set"));
  // }, [usernameSet]);

  useEffect(() => {
    console.log(user);
    console.log(showDmWindow);
  }, [user, showDmWindow]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        <ProfileBar username={usernameSet} avatar={user.avatar}/>
        <Sidebar />
        {activeServer == 0 && <FriendsProvider><Chat /></FriendsProvider>}
        {showFriends && <FriendsProvider><Friends /></FriendsProvider>}
        {(usernameSet === "not set") && <UsernameModal />}
        {showDmWindow && <DmChatWindow />}
    </div>
  )
}

export default Home