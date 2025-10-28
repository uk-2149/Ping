import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Settings,
  PlusCircle,
  FolderPlus,
  CalendarPlus,
  Bell,
  Shield,
  Pencil,
  EyeOff,
} from "lucide-react";
import { useServer } from "../../../context/ServerContext";

interface ServerMenuProps {
  isOpen: boolean;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  permissions: string[];
  onClick: () => void;
}

const ServerMenu: React.FC<ServerMenuProps> = ({
  isOpen,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { userPermissions, openInviteBox } = useServer();

  useEffect(() => {
    console.log("User permissions: ",userPermissions);
  }, [isOpen, userPermissions]);

  // Close on outside click
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
  //       onClose();
  //     }
  //   };
  //   if (isOpen) document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [isOpen, onClose]);

  const handleInvite = () => openInviteBox(true);
  const handleServerSettings = () => console.log("Open Server Settings");
  const handleCreateChannel = () => console.log("Create Channel clicked");
  const handleCreateCategory = () => console.log("Create Category clicked");
  const handleCreateEvent = () => console.log("Create Event clicked");
  const handleNotifications = () => console.log("Open Notifications");
  const handlePrivacy = () => console.log("Open Privacy Settings");
  const handleEditProfile = () => console.log("Edit Server Profile");
  const handleHideMuted = () => console.log("Hide Muted Channels");


  // menu with multiple permission support
  const menuItems: MenuItem[] = [
    { icon: Users, label: "Invite People", permissions: ["MANAGE_MEMBERS", "ADMIN"], onClick: handleInvite },
    { icon: Settings, label: "Server Settings", permissions: ["ADMIN"], onClick: handleServerSettings },
    { icon: PlusCircle, label: "Create Channel", permissions: ["MANAGE_CHANNELS", "ADMIN"], onClick: handleCreateChannel },
    { icon: FolderPlus, label: "Create Category", permissions: ["MANAGE_CHANNELS", "ADMIN"], onClick: handleCreateCategory },
    { icon: CalendarPlus, label: "Create Event", permissions: ["MANAGE_CHANNELS", "ADMIN"], onClick: handleCreateEvent },
    { icon: Bell, label: "Notification Settings", permissions: ["SEND_MESSAGES", "ADMIN"], onClick: handleNotifications },
    { icon: Shield, label: "Privacy Settings", permissions: ["ADMIN"], onClick: handlePrivacy },
    { icon: Pencil, label: "Edit Server Profile", permissions: ["ADMIN", "MANAGE_MEMBERS"], onClick: handleEditProfile },
    { icon: EyeOff, label: "Hide Muted Channels", permissions: ["SEND_MESSAGES", "ADMIN"], onClick: handleHideMuted },
  ];


  // Only show items if the user has *any one* of the required permissions
  const visibleItems = menuItems.filter((item) =>
    item.permissions.some((perm) => userPermissions.includes(perm))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-40 flex justify-center items-start bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-3 w-[90%] max-w-sm rounded-t-lg rounded-b-xl bg-[#1e1f22]/90 border border-[#2c2d31] shadow-2xl overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            {/* <div className="flex justify-between items-center px-5 py-3 border-b border-[#2c2d31]">
              <h2 className="text-sm font-semibold text-gray-100 tracking-wide">
                {serverName}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-[#2c2d31] transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div> */}

            {/* Menu Items */}
            <div className="flex flex-col py-2">
              {visibleItems.map(({ icon: Icon, label, onClick }) => (
                <motion.button
                  key={label}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClick}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:text-white transition-all"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-[#2b2d31] rounded-md">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <span>{label}</span>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#2c2d31] text-xs text-gray-500 flex justify-between">
              <span>
                Permissions:{" "}
                {Object.keys(userPermissions || {})
                  .filter((p) => userPermissions.includes(p))
                  .join(", ") || "None"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServerMenu;
