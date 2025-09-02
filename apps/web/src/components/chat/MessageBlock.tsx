import { motion } from "framer-motion";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 items-start"
    >
      {avatar && (
        <img
          src={avatar}
          alt={username}
          className="w-10 h-10 rounded-full"
        />
      )}

      <div className="flex flex-col">
        {/* Username + Time */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{username}</span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>

        {/* Message Content */}
        <div
          className={`mt-1 px-4 py-2 rounded-lg ${
            type === "system"
              ? "bg-transparent text-gray-400 italic"
              : "bg-white/5"
          }`}
        >
          {text}
        </div>
      </div>
    </motion.div>
  );
}
