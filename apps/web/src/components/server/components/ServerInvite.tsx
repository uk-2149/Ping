import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mail, UserPlus, Copy, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useServer } from "../../../context/ServerContext";
import api from "../../../lib/api"; // your axios instance
import { useChat } from "../../../context/ChatContext";

interface InviteModalProps {
  onInvite: (input: string) => void;
}

const ServerInvite: React.FC<InviteModalProps> = ({ onInvite }) => {
  const [input, setInput] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const { isOpenInvite, openInviteBox } = useServer(); // assume currentServer._id exists
  const { activeServer: currentServer } = useChat();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        openInviteBox(false);
      }
    };
    if (isOpenInvite) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenInvite, openInviteBox]);

  // Generate invite link on open
  useEffect(() => {
    const generateInvite = async () => {
      if (!currentServer?._id) return;
      setLoading(true);
      try {
        const inviteId = uuidv4();
        const res =await api.post(`/api/server/${currentServer._id}/invite/${inviteId}`);
        console.log(res.data);
        const link = `${window.location.origin}/invite/${inviteId}`;
        setInviteLink(link);
      } catch (error) {
        console.error("Error generating invite:", error);
        toast.error("Failed to generate invite link.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpenInvite) generateInvite();
    else setInviteLink("");
  }, [isOpenInvite, currentServer]);

  // Copy link
  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  // Manual invite handler
  const handleInvite = () => {
    if (!input.trim()) return;
    onInvite(input.trim());
    setInput("");
    openInviteBox(false);
  };

  return (
    <AnimatePresence>
      {isOpenInvite && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-[90%] max-w-md rounded-2xl bg-gray-950/90 border border-[#1b2335] shadow-2xl p-6 backdrop-blur-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => openInviteBox(false)}
              className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[#1a2235] transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-200" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#0b111f] rounded-lg border border-[#1a2235]">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-100">
                Invite to {currentServer?.name || "Server"}
              </h2>
            </div>

            {/* Invite Link */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">
                Invite Link
              </label>
              <div className="flex items-center gap-2 bg-[#0b111f] border border-[#1a2235] rounded-lg px-3 py-2 text-sm">
                {loading ? (
                  <span className="text-gray-500 animate-pulse">
                    Generating link...
                  </span>
                ) : (
                  <>
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="flex-1 bg-transparent outline-none text-gray-200 cursor-text"
                    />
                    <button
                      onClick={handleCopy}
                      disabled={!inviteLink}
                      className="p-1.5 rounded-md hover:bg-[#1a2235] transition"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                      )}
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This invite expires in 24 hours.
              </p>
            </div>

            {/* Manual Invite */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-400">
                Or invite by User ID or Email
              </label>
              <div className="flex items-center gap-2 bg-[#0b111f] border border-[#1a2235] rounded-lg px-3 py-2 focus-within:border-blue-500 transition-colors">
                <Mail className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="example@email.com or 64829a..."
                  className="flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-500 text-sm"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => openInviteBox(false)}
                className="px-4 py-2 text-sm rounded-lg bg-[#141b2b] text-gray-400 hover:bg-[#1a2235] hover:text-gray-200 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleInvite}
                disabled={!input.trim()}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all ${
                  input.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-900/50 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
                Send Invite
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServerInvite;
