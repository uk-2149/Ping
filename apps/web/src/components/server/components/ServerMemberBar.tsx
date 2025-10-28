import React, { useEffect } from "react";
import { useServer } from "../../../context/ServerContext";

const getInitial = (name: string) => name.charAt(0).toUpperCase();

const ServerMembersSidebar: React.FC = () => {

  const {
    roles
  } = useServer();

  useEffect(() => {
    console.log("Roles in sidebar:", roles);
  }, [roles]);

  return (
    <div className="w-80 bg-[#0b111f] text-gray-200 border-l border-gray-700 h-screen p-3 overflow-y-auto">
      {roles.map((role) => (
        <div key={role._id} className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            {role.name} — {role.members.length}
          </div>

          <div className="flex flex-col gap-1">
            {role.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-[#3a3c41] transition-colors duration-150 cursor-pointer"
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover bg-[#111a30]"
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
