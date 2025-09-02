import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MessageBlock from "./MessageBlock";
import UserInfoPanel from "./UserInfo";

import type { MessageBlockProps } from "./MessageBlock";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import MessageInput from "./MessageInput";

export default function DmChatWindow() {
  const { user } = useAuth();
  const { activeChat } = useChat();
  
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the other user from participants
  const otherUser = activeChat?.participants.find(p => p._id !== user?._id);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Convert chat messages to MessageBlock format
  const formatMessages = (): MessageBlockProps[] => {
    if (!activeChat?.messages || !user) return [];

    return activeChat.messages.map(message => {
  const isCurrentUser = message.from === user._id;
  const messageUser = isCurrentUser ? user : otherUser;
  console.log(otherUser);

  return {
    id: message.id,
    text: message.content,
    username: messageUser?.username || "Unknown User",
    avatar: messageUser?.avatar || "",
    timeStamp: message.timeStamp.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    type: "normal" as const,
    isCurrentUser: isCurrentUser
  };
});
  };

  const messages = formatMessages();

  // Don't render if no active chat or other user
  if (!activeChat || !otherUser || !user) {
    return (
      <div className="flex h-screen w-full sm:w-4/5 bg-[#0b111f] text-white items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">No active chat</p>
          <p className="text-gray-500 text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full sm:w-4/5 bg-[#0b111f] text-white">
      {/* Chat Section */}
      <div className="flex flex-col flex-1">
        {/* Top Header */}
        <div className="py-2 px-4 border-b border-gray-700 bg-[#0b111f] shadow-lg flex items-center justify-center">
          <div className="flex items-center justify-center">
            <p className="text-center">Direct Messages</p>
          </div>
        </div>

        {/* Chat Header with User Info */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="relative">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium">
                  {otherUser.username.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Status indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111827] ${
                otherUser.status === 'ONLINE' ? 'bg-green-400' :
                otherUser.status === 'AWAY' ? 'bg-yellow-400' :
                otherUser.status === 'DO_NOT_DISTURB' ? 'bg-red-400' : 'bg-gray-500'
              }`}></div>
            </div>
            <div>
              <h2 className="font-semibold">{otherUser.username}</h2>
              <p className="text-xs text-gray-400">
                {otherUser.status === 'ONLINE' ? 'Online' :
                 otherUser.status === 'AWAY' ? 'Away' :
                 otherUser.status === 'DO_NOT_DISTURB' ? 'Do Not Disturb' :
                 `Last seen ${otherUser.lastSeen ? new Date(otherUser.lastSeen).toLocaleDateString() : 'recently'}`}
              </p>
            </div>
          </div>
          <button
            className="lg:hidden px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-sm transition-colors"
            onClick={() => setShowInfo(true)}
          >
            Info
          </button>
        </div>

        {/* Messages Container */}
        <motion.div
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {messages.length > 0 ? (
            <>
              {messages.map((msg) => (
                <MessageBlock key={msg.id} {...msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400">
                      {otherUser.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{otherUser.username}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  This is the beginning of your direct message history with {otherUser.username}.
                </p>
                <p className="text-gray-500 text-xs">Send a message to start the conversation!</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Message Input */}
        <MessageInput />
      </div>

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 border-l border-white/10 bg-[#111827]">
        <UserInfoPanel />
      </div>

      {/* Mobile Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 lg:hidden">
          <div className="bg-[#111827] w-80 max-w-[90vw] p-4 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">User Info</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors p-1"
                onClick={() => setShowInfo(false)}
              >
                ✕
              </button>
            </div>
            <UserInfoPanel />
          </div>
        </div>
      )}
    </div>
  );
}