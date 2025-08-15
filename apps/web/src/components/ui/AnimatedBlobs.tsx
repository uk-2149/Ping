import { motion } from "framer-motion";

export default function AnimatedBlobs() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute left-[-10%] top-[-10%] h-[34rem] w-[34rem] rounded-full bg-violet-600/25 blur-[80px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 0.1, duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute right-[-8%] bottom-[-12%] h-[40rem] w-[40rem] rounded-full bg-blue-600/25 blur-[90px]"
      />
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[10%] top-[30%] h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 backdrop-blur-xl"
      />
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[12%] top-[18%] h-28 w-28 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 backdrop-blur-xl"
      />
    </>
  );
}