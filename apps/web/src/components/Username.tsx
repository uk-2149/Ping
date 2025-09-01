import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../context/ChatContext";

export default function UsernameModal() {
  const [username, setUname] = useState("");

  const {
    setUsername,
  } = useChat()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setUsername(username.trim());
    }
  };

  return (
    <AnimatePresence>
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md border border-violet-600/40"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold text-center mb-4 text-violet-400">
              Set Your Username
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Choose a unique username to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUname(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-violet-500 
                           text-white placeholder-gray-500 transition"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 
                           text-white font-medium shadow-lg shadow-violet-600/30 
                           transition-transform transform hover:scale-[1.02]"
              >
                Save Username
              </button>
            </form>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}
