import ServerChatWindow from './components/ServerChatWindow'
import ServerMembersSidebar from './components/ServerMemberBar'

function ServerMainWindow() {
  return (
    <div className="flex h-screen w-full bg-[#0b111f] text-white">
        <div className="flex-1">
          <ServerChatWindow />
        </div>
        <ServerMembersSidebar />
    </div>
  )
}

export default ServerMainWindow