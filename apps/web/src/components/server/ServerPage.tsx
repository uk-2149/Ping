import { useEffect, useState } from 'react';
import ServerMainWindow from './ServerMainWindow';
// import ServerMembersSidebar from './ServerMemberBar';
import ChannelsSidebar from './components/ServerSideBar';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import ServerInvite from './components/ServerInvite';
import CreateChannelModal from './components/CreateChannelModal';

function ServerPage() {
  const [showCCmodal, setShowCCmodal] = useState<boolean>(false);

  const {
    activeServer,
  } = useChat();

  const {
    user
  } = useAuth();

  const {
    getUserPermissions,
  } = useServer();

  useEffect(() => {
      if (!activeServer || !user) return;
      getUserPermissions(activeServer._id, user._id);
    }, [getUserPermissions, activeServer, user]);

  const handleInvite = (input: string) => {
    console.log("Invite sent to:", input);
    // Here call your backend: e.g. sendInviteToUser(serverId, input)
  };

  return (
    <div>
        <div className="flex w-[calc(100vw-65px)] h-screen bg-[#313338] text-gray-100">
                <div className='w-fit sm:w-[300px]'>
                  <ChannelsSidebar setShowCCmodal={setShowCCmodal}/>
                </div>
                <ServerMainWindow />
                <ServerInvite
                  onInvite={handleInvite}
                />
        </div>
        {showCCmodal && <CreateChannelModal setShowCCmodal={setShowCCmodal} />}
    </div>
  )
}

export default ServerPage