import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useFriends } from "../../context/FriendsContext";

// interface Friend {
//   id: string;
//   username: string;
//   avatar: string;
// }

interface DMModalProps {
  setDMModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateDM({ setDMModal }: DMModalProps) {
  const [selectedFriends, setSelectedFriends] = useState<any[]>([]);

  const {
    openDmWindow,
    setShowFriends,
  } = useChat();

  const {
    friends
  } = useFriends();

  const {
    user,
  } = useAuth();

  const toggleFriend = (fd) => {
    setSelectedFriends((prev) => {
      const isAlreadySelected = prev.find((f) => f._id === fd._id);
      
      if (isAlreadySelected) {
        // If friend is already selected, deselect them
        console.log("Deselected:", fd.username, fd._id);
        const newState = prev.filter((f) => f._id !== fd._id);
        console.log("New state:", newState);
        return newState;
      } else {
        // If friend is not selected, select only this friend (replace any previous selection)
        console.log("Selected:", fd.username, fd._id);
        const newState = [fd];
        console.log("New state:", newState);
        return newState;
      }
    });
  };

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
        >
          {/* Modal box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-lg bg-[#1e1f26] rounded-2xl shadow-xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Select Friends</h2>
              <button onClick={() => setDMModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Subtext */}
            <p className="px-6 pt-3 text-sm text-gray-400">
              You can add up to 9 more friends.
            </p>

            {/* Friend list */}
            <div className="px-6 py-3 max-h-[300px] overflow-y-auto space-y-2">
              {friends.map((fd) => (
        <motion.div
          key={fd._id} // Ensure friend.id is unique
          whileHover={{ scale: 1.01 }}
          className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
            selectedFriends.find((f) => f.id === fd._id)
              ? "bg-violet-600/20 border border-violet-500/40"
              : "bg-[#2a2c34] hover:bg-[#32343d]"
          }`}
          onClick={() => toggleFriend(fd)}
        >
          <div className="flex items-center gap-3">
            <img
              src={fd.avatar}
              alt={fd.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white font-medium">{fd.username}</p>
              <p className="text-xs text-gray-400">@{fd.username}</p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={!!selectedFriends.find((f) => f._id === fd._id)}
            readOnly
            className="w-5 h-5 accent-violet-500"
          />
        </motion.div>
      ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setDMModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDMModal(false);
                  openDmWindow(user, selectedFriends[0]);
                  setShowFriends(false);
                }}
                disabled={selectedFriends.length === 0}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white font-medium shadow hover:opacity-90 disabled:opacity-50"
              >
                Create DM
              </button>
            </div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}