import Sidebar from '../components/SideBar';
import { useEffect, useState } from 'react'
// import { servers } from '../types/index';
import Chat from '../components/chat/Chat';
import ProfileBar from '../components/ProfileBar';
import Friends from '../components/Friends/Friends';
import api from '../lib/api';
import UsernameModal from '../components/Username';
import DmChatWindow from '../components/chat/ChatWindow';

function Home() {
  const [activeServer, setActiveServer] = useState<null | number>(null);
  const [showFriends, setShowFriends] = useState<boolean>(false);
  const [usernameSet, setUsernameSet] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [dmwindow, setDmwindow] = useState<boolean>(false);
  const [dmFriends, setDmFriends] = useState<any[]>([]);

  const checkUsername = async() => {
    const res = await api.get("/api/users/getUser");
    setUser(res.data);
    if(res.data.username === "not set") {
      setUsernameSet(true);
    }
    // console.log(res.data);
    setUsername(res.data.username);
  }

  useEffect(() => {
    checkUsername();
  }, [])

  const onSubmit = async(username: string) => {
    const res = await api.post("/api/users/setUsername", { username });
    setUsernameSet(false);
    console.log(res.data);
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        <ProfileBar username={username} avatar={user?.avatar}/>
        <Sidebar setActiveServer={setActiveServer} setShowFriends={setShowFriends} />
        {activeServer == 0 && <Chat setShowFriends={setShowFriends} setDmWindow={setDmwindow} setDmFriends={setDmFriends} dmFriends={dmFriends}/>}
        {showFriends && <Friends />}
        {usernameSet && <UsernameModal onSubmit={onSubmit}/>}
        {dmwindow && <DmChatWindow user={dmFriends[0]}/>}
    </div>
  )
}

export default Home