import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Gift, Smile, PlusCircle, Paperclip, Mic } from "lucide-react";
import { useChat } from "../../../context/ChatContext";
import { useServer } from "../../../context/ServerContext";

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type?: "join" | "message" | "system";
  avatar?: string; // Added for better UX
}

export default function ServerChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      author: "System",
      content: "Welcome to Ping! Start chatting in this channel.",
      timestamp: "25 February 2025, 23:30",
      type: "system",
    },
    {
      id: "1",
      author: "uk.01",
      content: "has joined the server.",
      timestamp: "25 February 2025, 23:34",
      type: "join",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=uk01",
    },
    {
      id: "2",
      author: "_uk_2149",
      content: "Hello everyone! Excited to be here on Ping.",
      timestamp: "26 February 2025, 22:33",
      type: "message",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=uk2149",
    },
    {
      id: "3",
      author: "ping_user",
      content: "What's up? This looks like a cool chat app.",
      timestamp: "26 February 2025, 22:35",
      type: "message",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pinguser",
    },
    {
      id: "4",
      author: "_uk_2149",
      content: "Yeah, loving the design so far!",
      timestamp: "26 February 2025, 22:36",
      type: "message",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=uk2149",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { activeServer } = useChat();
  const { ActiveServerChat } = useServer();

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Math.random().toString(),
      author: "You",
      content: newMessage,
      timestamp: new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "message",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by author for better UX (consecutive messages without header repetition)
  const groupedMessages = messages.reduce((acc: Message[][], msg) => {
    if (acc.length === 0 || acc[acc.length - 1][0].author !== msg.author || msg.type !== "message") {
      acc.push([msg]);
    } else {
      acc[acc.length - 1].push(msg);
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[#121929] text-gray-200 overflow-hidden">
      {/* Header - Sticky, with shadow and responsive padding */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 md:px-6 border-b border-[#2a3550]/50 bg-[#0b111f]/95 backdrop-blur-xl shadow-md">
        <h2 className="text-lg md:text-xl font-bold text-white truncate"># {ActiveServerChat?.subchannel?.name || "general"}</h2>
        <div className="flex items-center gap-3 md:gap-4">
          <button className="hover:text-violet-400 transition-colors" aria-label="Notifications">
            🔔
          </button>
          <button className="hover:text-violet-400 transition-colors" aria-label="Members">
            👥
          </button>
        </div>
      </div>

      {/* Messages - Smooth scrolling, with gradient fade at top/bottom */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 relative">
        <div className="sticky top-0 z-5 h-4 bg-[#121929] pointer-events-none" />
        {/* Welcome Section */ }
            <div
              className="flex flex-col items-center justify-center text-center py-8 md:py-12"
            >
              <h2
                className="text-2xl md:text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-violet-400 to-blue-500"
              >
                Welcome to Ping
              </h2>
              <h3
                className="text-xl md:text-2xl font-semibold text-gray-300 mt-2"
              >
                {activeServer?.name || "Your Server"}
              </h3>
              <p className="text-gray-500 text-sm mt-2 max-w-md">
                This is the start of your conversation. Ping connects you seamlessly.
              </p>
              <p className="text-gray-600 text-xs mt-3">25 February 2025</p>
            </div>

        {/* Message Groups */}
          {groupedMessages.map((group, groupIndex) => {
            const firstMsg = group[0];
            return (
              <div
                key={groupIndex}
                className="group"
              >
                {firstMsg.type === "system" ? (
                  <div className="text-center text-sm text-gray-500 italic py-2">
                    {firstMsg.content}
                  </div>
                ) : firstMsg.type === "join" ? (
                  <div className="text-sm text-green-400 flex items-center gap-2 py-1">
                    <span className="font-medium">{firstMsg.author}</span>
                    <span className="text-gray-400">{firstMsg.content}</span>
                    <span className="text-gray-500 text-xs">{firstMsg.timestamp}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-1">
                      <img
                        src={firstMsg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstMsg.author}`}
                        alt={firstMsg.author}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-violet-500/30 group-hover:border-violet-500/50 transition"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-100 hover:text-violet-300 transition cursor-pointer">
                          {firstMsg.author}
                        </span>
                        <span className="text-xs text-gray-500">{firstMsg.timestamp}</span>
                      </div>
                    </div>
                    {group.map((msg) => (
                      <p
                        key={msg.id}
                        className="text-gray-300 ml-11 md:ml-14 mb-1 group-hover:bg-[#1a2235]/30 p-1 rounded-md transition"
                      >
                        {msg.content}
                      </p>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        <div ref={chatEndRef} />
        <div className="sticky bottom-0 z-5 h-4 bg-[#121929] pointer-events-none" />
      </div>

      {/* Message Input - Enhanced with more icons, responsive, and animations */}
      <div className="sticky bottom-0 z-10 px-4 md:px-6 py-3 border-t border-[#2a3550]/50 bg-[#0b111f]/95 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 md:gap-3 bg-[#111827] px-3 md:px-4 py-2 rounded-xl border border-[#1f2a44]/50 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/50 transition-shadow">
          <button className="hidden md:block">
            <PlusCircle size={20} className="text-gray-400 hover:text-violet-400 transition" />
          </button>
          <button>
            <Paperclip size={20} className="text-gray-400 hover:text-violet-400 transition" />
          </button>
          <input
            type="text"
            placeholder={`Message #${ActiveServerChat?.subchannel?.name || "general"}`}
            className="flex-1 bg-transparent outline-none text-sm md:text-base text-gray-200 placeholder-gray-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-gray-400 hover:text-violet-400 transition" />
            <Smile size={18} className="text-gray-400 hover:text-violet-400 transition" />
            <Mic size={18} className="hidden md:block text-gray-400 hover:text-violet-400 transition" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="text-violet-500 hover:text-violet-400 transition"
              disabled={!newMessage.trim()}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}