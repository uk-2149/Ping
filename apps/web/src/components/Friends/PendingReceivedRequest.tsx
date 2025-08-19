import api from "../../lib/api";
import { toast } from "react-hot-toast";

interface PendingReceivedRequestCardProps {
  request: any;
  onRequestUpdate: (requestId: string) => void; // Add this prop
}

const PendingReceivedRequestCard: React.FC<PendingReceivedRequestCardProps> = ({ request, onRequestUpdate }) => {

    const onAccept = async () => {
      try {
        console.log("Accepting friend request:", request._id);
        await api.post("/api/users/acceptFriendRequest", { requestId: request._id });
        alert("Friend request accepted!");
        onRequestUpdate(request.id);
        toast.success("Friend request accepted!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to accept request");
      }
    }

    const onReject = async () => {
      try {
        await api.post("/api/users/declineFriendRequest", { requestId: request._id });
        alert("Friend request rejected!");
        onRequestUpdate(request.id);
        toast.success("Friend request rejected!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to reject request");
      }
    }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#1a2332] hover:bg-[#1e293b] transition-all duration-300 shadow-sm hover:shadow-md">
      {/* User Info */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-lg font-bold text-white shadow-md">
          <img src={request.sender.avatar} alt={request.sender.username} className="w-11 h-11 rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white truncate">
              {request.sender.username}
            </span>
            <span className="text-gray-400 text-sm">
              {request.discriminator}
            </span>
          </div>
          <p className="text-sm text-violet-400 mt-0.5">
            Incoming Friend Request
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
          onClick={onAccept}
        >
          Accept
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-rose-500/80 hover:bg-rose-400 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
          onClick={onReject}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default PendingReceivedRequestCard;