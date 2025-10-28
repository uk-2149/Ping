import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import api from "../../../lib/api";
import { useChat } from "../../../context/ChatContext";

interface CreateServerModalProps {
  setShowSCmodal: (show: boolean) => void;
}

export default function CreateServerModal({ setShowSCmodal }: CreateServerModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { setActiveServer } = useChat();

  const handleCreate = async () => {
    setLoading(true);
    try {
        if (!name.trim()) return;
        const seed = name + Math.floor(Math.random() * 10000);
        const icon = `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`
        const res = await api.post("/api/server/createServer", { name, description, icon });
        console.log(res.data);
        setActiveServer(res.data.server.id);
        setName("");
        setDescription("");
        setShowSCmodal(false);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
        <>
          {/* Background overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSCmodal(false)}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-100"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[#1a2234] w-[90%] max-w-md rounded-2xl shadow-xl border border-white/10 p-6 relative">
              {/* Close button */}
              <button
                onClick={() => setShowSCmodal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <h2 className="text-xl font-bold text-white mb-1">Create a Server</h2>
              <p className="text-sm text-gray-400 mb-5">
                Give your server a name and description to get started.
              </p>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Server Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter server name"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter server description"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
<div className="mt-6 flex justify-end">
  <button
    onClick={handleCreate}
    disabled={loading}
    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
      loading
        ? "bg-violet-500 cursor-not-allowed text-white"
        : "bg-gradient-to-r from-violet-500 to-blue-500 hover:bg-gradient-to-r hover:from-violet-600 hover:to-blue-600 text-white hover:cursor-pointer"
    }`}
  >
    {loading ? (
      <>
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"
          ></path>
        </svg>
        <span>Creating...</span>
      </>
    ) : (
      "Create Server"
    )}
  </button>
</div>

            </div>
          </motion.div>
        </>
    </AnimatePresence>
  );
}
