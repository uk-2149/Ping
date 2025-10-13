import { useState } from "react";
import { ChevronDown, ChevronRight, Hash, Mic, MoreHorizontal } from "lucide-react";

const mockServer = {
  id: "server1",
  name: "Dev Hub",
  channels: [
    { id: "cat1", name: "GENERAL", type: "category" },
    { id: "ch1", name: "welcome", type: "text", parentId: "cat1" },
    { id: "ch2", name: "announcements", type: "text", parentId: "cat1" },

    { id: "cat2", name: "PROJECTS", type: "category" },
    { id: "ch3", name: "frontend-team", type: "text", parentId: "cat2" },
    { id: "ch4", name: "backend-team", type: "text", parentId: "cat2" },
    { id: "ch5", name: "voice-meeting", type: "voice", parentId: "cat2" },

    { id: "cat3", name: "SOCIAL", type: "category" },
    { id: "ch6", name: "memes", type: "text", parentId: "cat3" },
    { id: "ch7", name: "gaming", type: "voice", parentId: "cat3" },
  ],
};

const ChannelsSidebar = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeChannel, setActiveChannel] = useState<any>(null);

  const activeServer = mockServer;

  // Group channels by parent (categories)
  const categories = activeServer.channels.filter((c) => c.type === "category");
  const subchannels = (parentId: string) =>
    activeServer.channels.filter((c) => c.parentId === parentId);

  return (
    <div className="w-fit sm:w-[300px] h-screen bg-[#0b111f] flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-white font-semibold truncate">{activeServer.name}</h2>
        <MoreHorizontal className="text-gray-400 hover:text-white cursor-pointer" size={18} />
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((cat) => {
          const isOpen = expanded[cat.id] ?? true;
          return (
            <div key={cat.id} className="px-2">
              {/* Category Header */}
              <button
                onClick={() => setExpanded({ ...expanded, [cat.id]: !isOpen })}
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
                  {subchannels(cat.id).map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm truncate transition-all duration-200
                        ${
                          activeChannel?.id === ch.id
                            ? "bg-gray-700 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                      {ch.type === "text" ? (
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
