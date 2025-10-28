import ServerMembersSidebar from './ServerMemberBar'

function ServerMainWindow() {
  return (
    <div className='flex items-center justify-between w-full'>
        <div className=''>
            Main Content
        </div>
        <ServerMembersSidebar />
    </div>
  )
}

export default ServerMainWindow