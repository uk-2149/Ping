import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";

export default function FriendRequest() {
  const [username, setUsername] = useState("");
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Handle new friend request
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username.trim()) return;

  try {
    await api.post("/api/users/friendrequest", { username });
    showToast(`Friend request sent to ${username}!`);
    
    // Refresh the list instead of appending
    const res = await api.get("/api/users/getFriendRequests");
    setFriendRequests(res.data);
    
    setUsername(""); // Clear the input
  } catch (error: any) {
    showToast(error.response?.data?.message || "Failed to send request");
  }
};

  // Fetch pending requests
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const res = await api.get("/api/users/getFriendRequests");
        setFriendRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchFriendRequests();
  }, []);

  // Toast helper
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 w-full mx-auto"
    >
      {/* Add Friend Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 rounded-2xl shadow-lg p-6 border border-white/5"
      >
        <h2 className="text-xl font-semibold text-white">Add Friend</h2>
        <p className="text-gray-400 text-sm mt-1">
          You can add friends with their usernames.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Ping username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0b111f] text-white rounded-lg border border-transparent focus:border-violet-500 focus:ring-2 focus:ring-violet-500/40 outline-none transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="px-5 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Send
          </motion.button>
        </div>
      </form>

      {/* Pending Requests */}
      <div className="mt-6 bg-gray-800/40 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-3">Pending Requests</h3>
        {friendRequests.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending requests</p>
        ) : (
          <ul className="space-y-3">
            {friendRequests.map((req, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center bg-[#0b111f] px-4 py-3 rounded-xl border border-white/5"
              >
                {/* Left Side: Avatar + Username */}
                <div className="flex gap-3 items-center">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-lg font-bold text-white shadow-md overflow-hidden">
                    <img
                      src={req.receiver.avatar}
                      alt={req.receiver.username}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </div>
                  <span className="text-white font-medium">
                    {req.receiver?.username || "Unknown User"}
                  </span>
                </div>

                {/* Right Side: Status + Cancel Button */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">Pending</span>
                  <button
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    title="Cancel Request"
                  >
                    Cancel
                  </button>
                </div>
              </motion.li>

            ))}
          </ul>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-500 to-blue-500 text-white px-5 py-3 rounded-xl shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
