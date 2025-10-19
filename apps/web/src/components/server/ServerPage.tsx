import ServerMainWindow from './ServerMainWindow';
// import ServerMembersSidebar from './ServerMemberBar';
import ChannelsSidebar from './ServerSideBar';

function ServerPage() {

  return (
    <div>
        <div className="flex w-[calc(100vw-65px)] h-screen bg-[#313338] text-gray-100">
                <div className='w-fit sm:w-[300px]'>
                  <ChannelsSidebar />
                </div>
                <ServerMainWindow />
        </div>
    </div>
  )
}

export default ServerPage