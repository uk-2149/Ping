import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api"; // your axios instance
import type { Server } from "../../types";

export default function ServerInvitationPage() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<
    "loading" | "valid" | "invalid" | "accepted"
  >("loading");
  const [server, setServer] = useState<Server | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const res = await api.get(`/api/server/invite/${inviteId}`);
        setServer(res.data?.server);
        setStatus("valid");
      } catch (err: any) {
        console.error(err);
        setStatus("invalid");
      }
    };
    checkInvite();
  }, [inviteId]);

  const handleAccept = async () => {
    if (!inviteId) return;
    setAccepting(true);
    try {
      const res = await api.post(`/api/server/invite/accept/${inviteId}`);
      toast.success("Invite accepted! 🎉");
      setStatus("accepted");
      setTimeout(() => navigate(`/server/${res.data?.server?._id ?? ""}`), 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to accept invite.");
      setStatus("valid"); // Revert to valid to allow retry
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 text-white relative overflow-hidden">
      {/* Subtle background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-violet-500/10 rounded-full blur-xl"
            style={{
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-gray-800/80 border border-violet-500/20 rounded-2xl p-8 shadow-xl shadow-violet-500/10 flex flex-col items-center text-center space-y-6 backdrop-blur-md"
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
              <h2 className="text-lg font-medium text-gray-300">
                Verifying your invitation...
              </h2>
            </motion.div>
          )}

          {status === "invalid" && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <XCircle size={48} className="text-rose-500" />
              </motion.div>
              <h2 className="text-xl font-semibold text-rose-400">
                Invalid or Expired Invitation
              </h2>
              <p className="text-gray-400 text-sm max-w-xs">
                The link you followed is no longer valid. Please request a new one.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="mt-4 bg-rose-500/20 hover:bg-rose-500/30 text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-md"
              >
                Return Home
              </motion.button>
            </motion.div>
          )}

          {status === "valid" && server && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center space-y-6"
            >
              <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="p-[2px] rounded-full bg-gradient-to-tr from-violet-600 via-blue-500 to-fuchsia-500"
                >
                  <div className="bg-[#0b111f] p-4 rounded-full">
                    <img
                      src={server?.icon || "/default-server-icon.png"}
                      alt="Server Icon"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400"
              >
                Join {server.name}!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-sm max-w-sm"
              >
                You've been invited to this vibrant community. Accept to dive in!
              </motion.p>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAccept}
                disabled={accepting}
                className={`mt-4 px-8 py-3 rounded-full text-sm font-semibold transition-all ${
                  accepting
                    ? "bg-violet-500/50 cursor-wait"
                    : "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400"
                } shadow-lg`}
              >
                {accepting ? "Joining..." : "Accept Invitation"}
              </motion.button>
            </motion.div>
          )}

          {status === "accepted" && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Check size={48} className="text-green-400" />
              </motion.div>
              <h2 className="text-xl font-semibold text-green-400">Welcome Aboard!</h2>
              <p className="text-gray-400 text-sm">
                Redirecting you to the server in a moment...
              </p>
              <motion.div
                className="w-24 h-1 bg-green-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}