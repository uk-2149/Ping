import Sidebar from '../components/SideBar';
import React, { useState } from 'react'
import { servers } from '../types/index';
import Chat from '../components/chat/Chat';
import ProfileBar from '../components/ProfileBar';
import Friends from '../components/chat/Friends';

function Home() {

  const [activeServer, setActiveServer] = useState<null | number>(null);
  const [showFriends, setShowFriends] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        <ProfileBar />
        <Sidebar setActiveServer={setActiveServer} setShowFriends={setShowFriends}/>
        {activeServer == 0 && <Chat setShowFriends={setShowFriends}/>}
        {showFriends && <Friends />}
    </div>
  )
}

export default Home