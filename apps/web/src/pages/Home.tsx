import Sidebar from '../components/SideBar';
import { useEffect, useState } from 'react'
// import { servers } from '../types/index';
import Chat from '../components/chat/Chat';
import ProfileBar from '../components/ProfileBar';
import Friends from '../components/Friends/Friends';
import UsernameModal from '../components/Username';
import DmChatWindow from '../components/chat/ChatWindow';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { FriendsProvider } from '../context/FriendsContext';
import CreateServerModal from '../components/server/components/CreateServerModal';
import ServerSidebar from '../components/server/components/ServerSideBar';
import ServerPage from '../components/server/ServerPage';

function Home() {

  const [showSCmodal, setShowSCmodal] = useState<boolean>(false);

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
    
    <div className="flex h-screen w-screen bg-gray-900 text-white">
      <ProfileBar username={usernameSet} avatar={user?.avatar || usernameSet[0]}/>
        <Sidebar setShowSCmodal={setShowSCmodal} />
        
        {!activeServer && <FriendsProvider><Chat /></FriendsProvider>}
        {(!activeServer) && showFriends && <FriendsProvider><Friends /></FriendsProvider>}
        {(usernameSet === "not set") && <UsernameModal />}
        {(!activeServer) && showDmWindow && <DmChatWindow />}
        {showSCmodal && <CreateServerModal setShowSCmodal={setShowSCmodal} />}

        {activeServer && <ServerPage />}
    </div>
    
  )
}

export default Home