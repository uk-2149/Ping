interface UserInfoPanelProps {
    user: any;
}

export default function UserInfoPanel({ user }: UserInfoPanelProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <img
        src="https://i.pravatar.cc/100?img=12"
        alt="user avatar"
        className="w-24 h-24 rounded-full mb-3"
      />
      <h2 className="text-lg font-semibold">{user.username}</h2>
      <p className="text-sm text-gray-400 mb-4">@{user.username}</p>

      <div className="w-full text-left space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-gray-300">Status</h3>
          <p className="text-sm text-green-400">{user.status}</p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-300">About</h3>
          <p className="text-sm text-gray-400">Loves coding, coffee ☕, and gaming 🎮</p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-300">Mutual Friends</h3>
          <p className="text-sm text-gray-400">3 mutual friends</p>
        </div>
      </div>
    </div>
  );
}
