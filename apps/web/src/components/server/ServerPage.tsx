import ServerMainWindow from './ServerMainWindow';
import ServerMembersSidebar from './ServerMemberBar';
import ChannelsSidebar from './ServerSideBar';

function ServerPage() {
  return (
    <div>
        <div className="flex w-full h-screen bg-[#313338] text-gray-100">
            <div className='w-fit sm:w-[300px]'>
                <ChannelsSidebar />
            </div>
            <ServerMainWindow />
            <ServerMembersSidebar />
        </div>
    </div>
  )
}

export default ServerPage