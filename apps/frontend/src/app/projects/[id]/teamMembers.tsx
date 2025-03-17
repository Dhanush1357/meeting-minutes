import { useState, useEffect } from "react";
import {
  Search,
  Users2,
  PlusCircle,
  X,
  Loader2,
  UserPlus,
  Save,
  Menu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectStatusType, ProjectType } from "../types";
import { CurrentUserType } from "@/app/users/types";
import { MultiSelectUsers } from "@/components/MultiSelectUser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { UserRole } from "@/app/users/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchAllUsers } from "@/app/users/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ClientLogo";

interface TeamMembersSectionProps {
  project: ProjectType | null;
  setProject: any;
}

const TeamMembersSection: React.FC<TeamMembersSectionProps> = ({
  project,
  setProject,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [users, setUsers] = useState<CurrentUserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { currentUser } = useAuthStore();

  // State for tracking users in each role (for existing members)
  const [currentRoles, setCurrentRoles] = useState<{
    [key: string]: {
      user_id: number;
      name: string;
      email: string;
      assigned_at: string;
    }[];
  }>({});

  // State for tracking selected users for each role in add dialog
  const [roleSelections, setRoleSelections] = useState({
    [UserRole.CREATOR]: [] as string[],
    [UserRole.REVIEWER]: [] as string[],
    [UserRole.APPROVER]: [] as string[],
    [UserRole.CLIENT]: [] as string[],
    [UserRole.VENDOR]: [] as string[],
    [UserRole.PARTICIPANT]: [] as string[],
  });
  const [projectLogo, setProjectLogo] = useState<string | null>(project?.client_logo || null);

  const handleLogoUpload = async (path: string) => {
    setProjectLogo(path);
    
    await apiFactory(`${API_ENDPOINTS.PROJECTS.BASE}/${project?.id}`, {
      method: "PATCH",
      body: { client_logo: path },
    });
  };

  const handleLogoRemove = async () => {
    setProjectLogo(null);
    
    await apiFactory(`${API_ENDPOINTS.PROJECTS.BASE}/${project?.id}/remove-logo`, {
      method: "POST",
    });
  };

  // Get unique roles for filter
  const uniqueRoles = [
    "ALL",
    ...new Set(
      project?.user_roles?.map((role) => role?.role || "").filter(Boolean) || []
    ),
  ];
  // Filter users based on search and role
  const filteredUsers = project?.user_roles?.filter((role) => {
    const firstName = role?.user?.first_name || "";
    const lastName = role?.user?.last_name || "";

    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      role?.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "ALL" || role.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Initialize current roles when dialog opens
  useEffect(() => {
    if (isEditDialogOpen && project?.user_roles) {
      // Group users by role
      const groupedRoles: {
        [key: string]: {
          user_id: number;
          name: string;
          email: string;
          assigned_at: string;
        }[];
      } = {};

      // Initialize all role keys
      Object.values(UserRole).forEach((role) => {
        groupedRoles[role] = [];
      });

      // Fill with existing users
      project.user_roles.forEach((roleItem) => {
        if (roleItem.role && roleItem.user) {
          const { user_id, role, assigned_at } = roleItem;
          const { first_name, last_name, email } = roleItem?.user;

          if (!groupedRoles[role]) {
            groupedRoles[role] = [];
          }

          groupedRoles[role].push({
            user_id,
            name: `${first_name || ""} ${last_name || ""}`,
            email: email || "",
            assigned_at,
          });
        }
      });

      setCurrentRoles(groupedRoles);
    }
  }, [isEditDialogOpen, project?.user_roles]);

  // Get available users for a specific role
  const getAvailableUsersForRole = (role: UserRole) => {
    // Get all user IDs already assigned to any role
    const allAssignedUserIds = Object.values(currentRoles).flatMap((users) =>
      users.map((user) => user.user_id.toString())
    );

    // Get all user IDs that are already selected in other roles for new additions
    const selectedInOtherRoles = Object.entries(roleSelections)
      .filter(([r]) => r !== role) // Exclude current role
      .flatMap(([_, userIds]) => userIds);

    // Return users that aren't already assigned and aren't selected in other roles
    return users.filter(
      (user) =>
        !allAssignedUserIds.includes(user.id.toString()) &&
        !selectedInOtherRoles.includes(user.id.toString())
    );
  };

  // Handler for selecting users in a role
  const handleRoleSelection = (role: UserRole, selectedIds: string[]) => {
    setRoleSelections((prev) => ({
      ...prev,
      [role]: selectedIds,
    }));
  };

  // Remove user from current assignments
  const handleRemoveUser = (role: string, userId: number) => {
    setCurrentRoles((prev) => {
      const updated = { ...prev };
      updated[role] = updated[role].filter((user) => user.user_id !== userId);
      return updated;
    });
  };

  // Load users when dialog opens
  useEffect(() => {
    if (isEditDialogOpen) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const usersData = await fetchAllUsers();
          setUsers(usersData);
        } catch (error) {
          setIsLoadingUsers(false);
          toast("Failed to load users");
          console.error(error);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [isEditDialogOpen]);

  // Save all changes (both additions and removals)
  const handleSaveChanges = async () => {
    if (!project?.id) {
      toast("Project not found. Please refresh the page.");
      return;
    }

    try {
      setIsSubmitting(true);

      const newUserRoles = [
        ...Object.entries(currentRoles).flatMap(([role, users]) =>
          users.map((user) => ({
            user_id: user.user_id,
            role: role,
            assigned_by: currentUser?.id || "System",
            assigned_at: user.assigned_at,
          }))
        ),
        ...Object.entries(roleSelections).flatMap(([role, userIds]) =>
          userIds.map((userId: string) => ({
            user_id: parseInt(userId),
            role: role,
            assigned_by: currentUser?.id || "System",
            assigned_at: new Date().toISOString(),
          }))
        ),
      ];

      await apiFactory(`${API_ENDPOINTS.PROJECTS.BASE}/${project.id}`, {
        method: "PATCH",
        body: { user_roles: newUserRoles },
      });

      // Update local project state
      setProject((prev: any) => ({
        ...prev,
        user_roles: newUserRoles.map((role) => ({
          role: role.role,
          user: users.find((user) => user.id === role.user_id) || {},
        })),
      }));

      // Reset state and close dialog
      setIsEditDialogOpen(false);
      setRoleSelections({
        [UserRole.CREATOR]: [],
        [UserRole.REVIEWER]: [],
        [UserRole.APPROVER]: [],
        [UserRole.CLIENT]: [],
        [UserRole.VENDOR]: [],
        [UserRole.PARTICIPANT]: [],
      });

      toast("Team members updated successfully");
    } catch (err) {
      setIsSubmitting(false);
      toast("Failed to update team members");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has permission to edit
  const canEditTeam =
    currentUser?.role === UserRole.SUPER_ADMIN &&
    project?.status != ProjectStatusType.CLOSED;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-0 justify-start">
          <Users2 className="h-6 w-6 text-gray-500" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {project?.user_roles?.length} Members
          </h2>
        </div>
        {canEditTeam && (
          <div className="justify-end sm:ml-auto flex items-center gap-4">
            <div>
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Manage Team Members</DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="current">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="current">Current Members</TabsTrigger>
                      <TabsTrigger value="add">Add Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="space-y-4 mt-4">
                      <h3 className="font-medium text-gray-700">
                        Current Team Members
                      </h3>

                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-gray-500">
                            Loading members...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(currentRoles).map(([role, users]) =>
                            users.length > 0 ? (
                              <div
                                key={`role-group-${role}`}
                                className="space-y-2"
                              >
                                <h4 className="text-sm font-medium text-gray-600">
                                  {role}
                                </h4>
                                <div className="space-y-2">
                                  {users.map((user) => (
                                    <div
                                      key={`role-${role}-user-${user.user_id}`}
                                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md border"
                                    >
                                      <div>
                                        <p className="text-sm font-medium">
                                          {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {user?.email}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleRemoveUser(role, user.user_id)
                                        }
                                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null
                          )}

                          {Object.values(currentRoles).every(
                            (users) => users.length === 0
                          ) && (
                            <p className="text-center py-4 text-gray-500">
                              No team members assigned yet.
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="add" className="space-y-4 mt-4">
                      <h3 className="font-medium text-gray-700">
                        Add New Members
                      </h3>

                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-gray-500">
                            Loading users...
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Creator Role */}
                          <div>
                            <Label htmlFor={UserRole.CREATOR}>Creator</Label>
                            <MultiSelectUsers
                              users={getAvailableUsersForRole(UserRole.CREATOR)}
                              selectedUsers={roleSelections[UserRole.CREATOR]}
                              onSelect={(selectedIds) =>
                                handleRoleSelection(
                                  UserRole.CREATOR,
                                  selectedIds
                                )
                              }
                              placeholder="Select creators..."
                            />
                          </div>

                          {/* Reviewer Role */}
                          <div>
                            <Label htmlFor={UserRole.REVIEWER}>Reviewer</Label>
                            <MultiSelectUsers
                              users={getAvailableUsersForRole(
                                UserRole.REVIEWER
                              )}
                              selectedUsers={roleSelections[UserRole.REVIEWER]}
                              onSelect={(selectedIds) =>
                                handleRoleSelection(
                                  UserRole.REVIEWER,
                                  selectedIds
                                )
                              }
                              placeholder="Select reviewers..."
                            />
                          </div>

                          {/* Approver Role */}
                          <div>
                            <Label htmlFor={UserRole.APPROVER}>Approver</Label>
                            <MultiSelectUsers
                              users={getAvailableUsersForRole(
                                UserRole.APPROVER
                              )}
                              selectedUsers={roleSelections[UserRole.APPROVER]}
                              onSelect={(selectedIds) =>
                                handleRoleSelection(
                                  UserRole.APPROVER,
                                  selectedIds
                                )
                              }
                              placeholder="Select approvers..."
                            />
                          </div>

                          {/* Client Role */}
                          <div>
                            <Label htmlFor={UserRole.CLIENT}>Client</Label>
                            <MultiSelectUsers
                              users={getAvailableUsersForRole(UserRole.CLIENT)}
                              selectedUsers={roleSelections[UserRole.CLIENT]}
                              onSelect={(selectedIds) =>
                                handleRoleSelection(
                                  UserRole.CLIENT,
                                  selectedIds
                                )
                              }
                              placeholder="Select clients..."
                            />
                          </div>

                          {/* Vendor Role */}
                          <div>
                            <Label htmlFor={UserRole.VENDOR}>Vendor</Label>
                            <MultiSelectUsers
                              users={getAvailableUsersForRole(UserRole.VENDOR)}
                              selectedUsers={roleSelections[UserRole.VENDOR]}
                              onSelect={(selectedIds) =>
                                handleRoleSelection(
                                  UserRole.VENDOR,
                                  selectedIds
                                )
                              }
                              placeholder="Select vendors..."
                            />
                          </div>

                          {/* Participant Role */}
                          <div>
                            <Label htmlFor={UserRole.PARTICIPANT}>
                              Participant
                            </Label>
                            <MultiSelectUsers
                              users={getAvailableUsersForRole(
                                UserRole.PARTICIPANT
                              )}
                              selectedUsers={
                                roleSelections[UserRole.PARTICIPANT]
                              }
                              onSelect={(selectedIds) =>
                                handleRoleSelection(
                                  UserRole.PARTICIPANT,
                                  selectedIds
                                )
                              }
                              placeholder="Select participants..."
                            />
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      onClick={() => setIsEditDialogOpen(false)}
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <Label>Client Logo</Label>
              <ImageUpload
                initialImage={projectLogo}
                onUploadSuccess={handleLogoUpload}
                handleLogoRemove={handleLogoRemove}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 relative">
        {/* Mobile Filter Toggle */}
        <div className="sm:hidden flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <Menu className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Mobile Filter Dropdown */}
        {isMobileFilterOpen && (
          <div className="sm:hidden absolute top-full right-0 z-10 bg-white border rounded-md shadow-lg p-4 mt-2 w-full">
            <div className="space-y-4">
              <div>
                <Label>Search</Label>
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsMobileFilterOpen(false);
                  }}
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  className="w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  {uniqueRoles.map((role) => (
                    <option key={`filter-role-${role}`} value={role}>
                      {role === "ALL" ? "All Roles" : role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden sm:relative sm:flex sm:flex-1 sm:items-center sm:gap-4 w-full">
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
              <option key={`filter-role-${role}`} value={role}>
                {role === "ALL" ? "All Roles" : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers?.map((role: any) => (
            <div
              key={`${role.user_id}-${role.role}`}
              className="flex items-start space-x-4 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {(role?.user?.first_name?.[0] ?? "").toUpperCase()}
                    {(role?.user?.last_name?.[0] ?? "").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {role?.user?.first_name || ""} {role?.user?.last_name || ""}
                  </p>
                  <Badge
                    className="ml-2 text-xs"
                    variant={role.role === "REVIEWER" ? "secondary" : "outline"}
                  >
                    {role.role}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {role?.user?.email}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  Added {new Date(role.assigned_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-gray-500">
              No team members found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersSection;
