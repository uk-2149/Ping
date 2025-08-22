import { useState } from "react";
import { motion } from "framer-motion";
import MessageBlock from "./MessageBlock";
import UserInfoPanel from "./UserInfo";

import type { MessageBlockProps } from "./MessageBlock";

interface ChatWindowProps {
    user: any;
}

export default function DmChatWindow({ user }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageBlockProps[]>([
    {
      id: 1,
      text: "Hey! How are you doing?",
      username: "_uk_2149",
      avatar: "https://i.pravatar.cc/40?img=12",
      time: "09/03/2024, 23:05",
      type: "normal",
    },
    {
      id: 2,
      text: "You missed a call from noone_6954 that lasted a few seconds.",
      username: "System",
      avatar: "",
      time: "24/11/2024, 14:32",
      type: "system",
    },
  ]);

  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#0b111f] text-white">
      {/* Chat Section */}
      <div className="flex flex-col flex-1">
        <div className="py-2 px-4 border-b border-gray-700 bg-[#0b111f] shadow-lg flex items-center justify-center">
             <div className="flex items-center justify-center">
                <p className="text-center">Direct Messages</p>
             </div>
      </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#111827]">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
            <h2 className="font-semibold">{user.username}</h2>
          </div>
          <button
            className="lg:hidden px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-sm"
            onClick={() => setShowInfo(true)}
          >
            Info
          </button>
        </div>

        {/* Messages */}
        <motion.div
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {messages.map((msg) => (
            <MessageBlock key={msg.id} {...msg} />
          ))}
        </motion.div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/10 bg-[#111827]">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full px-4 py-2 rounded-lg bg-[#1a2234] text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 border-l border-white/10 bg-[#111827]">
        <UserInfoPanel user={user}/>
      </div>

      {/* Mobile Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#111827] w-80 p-4 rounded-2xl shadow-lg">
            <button
              className="mb-3 text-right text-gray-400 hover:text-white"
              onClick={() => setShowInfo(false)}
            >
              ✕
            </button>
            <UserInfoPanel user={user}/>
          </div>
        </div>
      )}
    </div>
  );
}
