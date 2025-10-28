import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Hash, Mic } from "lucide-react";
import ServerMenu from "./ServerMenu";
import { useChat } from "../../../context/ChatContext";
import api from "../../../lib/api";

const ChannelsSidebar = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [channels, setChannels] = useState<any[]>([]); // store categories with subchannels

  const { activeServer } = useChat();

  useEffect(() => {
    if (activeServer?._id) fetchChannels();
  }, [activeServer]);

  if(!activeServer) return null;

  const fetchChannels = async () => {
    try {
      const res = await api.get(`/api/server/getChannels/${activeServer._id}`);
      setChannels(res.data);
      console.log("Fetched channels:", res.data);
    } catch (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
    }
  };

  if (!activeServer) return null;

  return (
    <div className="w-fit sm:w-[300px] h-screen bg-[#0b111f] flex flex-col border-r border-gray-800">
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        className="px-4 py-3 border-b border-gray-700 flex items-center justify-between hover:bg-gray-700/50 cursor-pointer"
      >
        <h2 className="text-white font-semibold truncate">{activeServer.name}</h2>
        <ChevronDown
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Channels */}
      <div className="relative flex-1 overflow-y-auto">
        <ServerMenu
          isOpen={open}
          onClose={() => setOpen(false)}
        />

        {channels.map((cat) => {
          const isOpen = expanded[cat._id] ?? true;
          return (
            <div key={cat._id} className="px-2">
              {/* Category Header */}
              <button
                onClick={() => setExpanded({ ...expanded, [cat._id]: !isOpen })}
                className="flex items-center gap-1 w-full py-2 text-xs font-bold uppercase text-gray-400 hover:text-gray-200"
              >
                {isOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                {cat.name}
              </button>

              {/* Subchannels */}
              {isOpen && (
                <div className="ml-4 space-y-1">
                  {cat.subChannels?.map((ch: any) => (
                    <button
                      key={ch._id}
                      onClick={() => setActiveChannel(ch)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm truncate transition-all duration-200
                        ${
                          activeChannel?._id === ch._id
                            ? "bg-gray-700 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                      {ch.type === "TEXT" ? (
                        <Hash size={16} />
                      ) : (
                        <Mic size={16} />
                      )}
                      <span className="truncate">{ch.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelsSidebar;
