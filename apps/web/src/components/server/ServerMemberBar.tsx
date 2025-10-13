import React from "react";

interface Member {
  id: string;
  name: string;
  avatar?: string;
}

interface RoleGroup {
  id: string;
  name: string;
  members: Member[];
}

const mockRoles: RoleGroup[] = [
  {
    id: "1",
    name: "Creator",
    members: [
      { id: "u1", name: "Utkal", avatar: "https://i.pravatar.cc/40?img=1" },
    ],
  },
  {
    id: "2",
    name: "Moderators",
    members: [
      { id: "u2", name: "WERT", avatar: "https://i.pravatar.cc/40?img=2" },
      { id: "u3", name: "ASFG" },
    ],
  },
  {
    id: "3",
    name: "Members",
    members: [
      { id: "u4", name: "Qwer", avatar: "https://i.pravatar.cc/40?img=3" },
      { id: "u5", name: "Rohan" },
      { id: "u6", name: "Ayush", avatar: "https://i.pravatar.cc/40?img=4" },
      { id: "u7", name: "Ethan" },
    ],
  },
];

const getInitial = (name: string) => name.charAt(0).toUpperCase();

const ServerMembersSidebar: React.FC = () => {
  return (
    <div className="w-full bg-[#0b111f] text-gray-200 border-l border-gray-700 h-screen p-3 overflow-y-auto">
      {mockRoles.map((role) => (
        <div key={role.id} className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            {role.name} — {role.members.length}
          </div>

          <div className="flex flex-col gap-1">
            {role.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-[#3a3c41] transition-colors duration-150 cursor-pointer"
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600 text-white font-medium">
                    {getInitial(member.name)}
                  </div>
                )}
                <span className="text-sm font-medium truncate">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServerMembersSidebar;
