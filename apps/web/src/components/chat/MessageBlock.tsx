import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export interface MessageBlockProps {
  id: string;
  text: string;
  username: string;
  avatar?: string;
  timeStamp: string;
  type?: "system" | "normal";
}

export default function MessageBlock({
  text,
  username,
  avatar,
  timeStamp: time,
  type = "normal",
}: MessageBlockProps) {
  const { user } = useAuth();
  const isOwnMessage = user?.username === username;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 items-end w-full ${
        isOwnMessage ? "flex-row-reverse" : ""
      } mt-2`}
    >

        <img
          src={avatar}
          alt={username}
          className="w-8 h-8 rounded-full border border-gray-700"
        />

      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
          <span className="font-medium text-xs text-gray-400 mb-1">
            {!isOwnMessage ?  `${username} | ` : ""}
            <span className="text-xs text-gray-400">{new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {isOwnMessage && ` | ${username}`}
          </span>

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm text-sm transition-colors duration-200
            ${
              type === "system"
                ? "bg-transparent text-gray-400 italic"
                : isOwnMessage
                ? "bg-blue-800 text-white rounded-br-sm hover:bg-blue-600"
                : "bg-gray-800 text-gray-100 rounded-bl-sm hover:bg-gray-700"
            }
          `}
        >
          {text}
        </div>
      </div>
    </motion.div>
  );
}
