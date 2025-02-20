import { useState } from "react";
import { Search, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProjectType } from "../types";

interface TeamMembersSectionProps {
  project: ProjectType | null;
}

const TeamMembersSection: React.FC<TeamMembersSectionProps> = ({ project }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Get unique roles for filter
  const uniqueRoles = [
    "ALL",
    ...new Set(project?.user_roles.map((role) => role.role)),
  ];

  // Filter users based on search and role
  const filteredUsers = project?.user_roles.filter((role) => {
    const fullName =
      `${role.user.first_name} ${role.user.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      role.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "ALL" || role.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users2 className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <Badge variant="secondary" className="ml-2">
            {project?.user_roles.length} members
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <select
          className="px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>
              {role === "ALL" ? "All Roles" : role}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers?.map((role) => (
            <div
              key={role.user_id}
              className="flex items-start space-x-4 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {role.user.first_name[0]}
                    {role.user.last_name[0]}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {role.user.first_name} {role.user.last_name}
                  </p>
                  <Badge
                    className="ml-2"
                    variant={role.role === "REVIEWER" ? "secondary" : "outline"}
                  >
                    {role.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {role.user.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Added {new Date(role.assigned_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No team members found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersSection;
