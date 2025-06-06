"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, ArrowUpDown } from "lucide-react";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { formatDate } from "@/lib/utils";
import { UserRole } from "../users/types";
import { ProjectType } from "./types";
import { CurrentUserType } from "../users/types";
import { fetchAllUsers, fetchUsers } from "../users/utils";
import { fetchProjects, getProjectStatusBadgeColor } from "./utils";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusLabels } from "./constants";
import { MultiSelectUsers } from "@/components/MultiSelectUser";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ProfileCompletionModal from "../users/ProfileCompletionModal";
import { usePagination } from "@/hooks/usePagination";
import { ImageUpload } from "@/components/ClientLogo";

type UserRoleKeys = Exclude<UserRole, UserRole.SUPER_ADMIN>;

const ProjectsPage: React.FC = () => {
  const {
    data: projects,
    loading,
    pageCount,
    currentPage,
    goToPage,
    meta,
    refetch,
  } = usePagination({
    fetchFn: fetchProjects,
    pageSize: 10,
  });

  const [users, setUsers] = useState<CurrentUserType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [logoPath, setLogoPath] = useState("");
  const [isLoadingCreation, setIsLoadingCreation] = useState(false);
  const { currentUser } = useAuthStore();
  const router = useRouter();

  // State for tracking selected users for each role
  const [roleSelections, setRoleSelections] = useState({
    [UserRole.CREATOR]: [] as string[],
    [UserRole.REVIEWER]: [] as string[],
    [UserRole.APPROVER]: [] as string[],
    [UserRole.CLIENT]: [] as string[],
    [UserRole.VENDOR]: [] as string[],
    [UserRole.PARTICIPANT]: [] as string[],
  });
  const [projectLogo, setProjectLogo] = useState<string | null>(null);
  
  const handleLogoUpload = (path: string) => {
    setProjectLogo(path);
  };

  const handleLogoRemove = () => {
    setProjectLogo(null);
  };

  // Get available users for a specific role
  const getAvailableUsersForRole = (role: UserRole) => {
    // Get all user IDs that are already selected in other roles
    const selectedInOtherRoles = Object.entries(roleSelections)
      .filter(([r]) => r !== role) // Exclude current role
      .flatMap(([_, userIds]) => userIds);

    // Return all users that aren't selected in other roles
    return users.filter(
      (user) => !selectedInOtherRoles.includes(user.id.toString())
    );
  };

  // Handler for selecting users in a role
  const handleRoleSelection = (role: UserRole, selectedIds: string[]) => {
    setRoleSelections((prev) => ({
      ...prev,
      [role]: selectedIds,
    }));
  };

  const columns: ColumnDef<ProjectType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={getProjectStatusBadgeColor(row.original.status)}
        >
          {ProjectStatusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.original.created_at),
    },
  ];

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setIsLoadingCreation(true);
      // Transform selections into the format expected by CategoriesOnProjects
      const userRoles = Object.entries(roleSelections).flatMap(
        ([role, userIds]) =>
          userIds.map((userId: string) => ({
            user_id: parseInt(userId),
            role: role,
            assigned_by: currentUser?.id || "System",
            assigned_at: new Date().toISOString(),
          }))
      );

      const projectData = {
        title: formData.get("title"),
        client_logo: projectLogo,
        user_roles: userRoles,
      };

      await apiFactory(API_ENDPOINTS.PROJECTS.BASE, {
        method: "POST",
        body: projectData,
      });

      setIsOpen(false);
      setRoleSelections({
        [UserRole.CREATOR]: [],
        [UserRole.REVIEWER]: [],
        [UserRole.APPROVER]: [],
        [UserRole.CLIENT]: [],
        [UserRole.VENDOR]: [],
        [UserRole.PARTICIPANT]: [],
      });

      await refetch();
    } catch (err) {
      setIsLoadingCreation(false);
      toast.error("Failed to add project");
    } finally {
      setIsLoadingCreation(false);
      form.reset();
    }
  };

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const usersData = await fetchAllUsers();
          setUsers(usersData);
        } catch (error) {
          setIsLoadingUsers(false);
          toast.error("Failed to load users");
          console.error(error);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [isOpen]);

  const handleRowClick = (project: ProjectType) => {
    router.push(`/projects/${project.id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mx-auto max-w-[85rem] px-4 pt-8 sm:px-6 lg:px-8">
        {/* Header Section with improved styling */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Projects
              </h1>
              <p className="text-gray-500">
                Manage and organize all your team's projects
              </p>
            </div>
  
            {currentUser?.role === UserRole.SUPER_ADMIN && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="group text-white hover:text-black relative overflow-hidden bg-[#127285] transition-all duration-300 hover:shadow-md"
                    size="lg"
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="relative flex items-center">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Project
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProject} className="space-y-2">
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="title" className="text-base font-medium">Project Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="Enter project title"
                          className="mt-1 w-full rounded-lg border-gray-200 text-lg"
                          required
                        />
                      </div>
                      
                      {/* User Role Selection */}
                      <div className="space-y-2 rounded-lg bg-gray-50 pt-2">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                          Assign Users to Roles
                        </h3>
  
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center p-6 rounded-lg bg-white">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">
                              Loading users...
                            </span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {/* Creator Role */}
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                              <Label htmlFor={UserRole.CREATOR} className="text-sm font-medium text-gray-700">Creator</Label>
                              <MultiSelectUsers
                                users={getAvailableUsersForRole(UserRole.CREATOR)}
                                selectedUsers={roleSelections[UserRole.CREATOR]}
                                onSelect={(selectedIds) => handleRoleSelection(UserRole.CREATOR, selectedIds)}
                                placeholder="Select creators..."
                              />
                            </div>
  
                            {/* Reviewer Role */}
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                              <Label htmlFor={UserRole.REVIEWER} className="text-sm font-medium text-gray-700">Reviewer</Label>
                              <MultiSelectUsers
                                users={getAvailableUsersForRole(UserRole.REVIEWER)}
                                selectedUsers={roleSelections[UserRole.REVIEWER]}
                                onSelect={(selectedIds) => handleRoleSelection(UserRole.REVIEWER, selectedIds)}
                                placeholder="Select reviewers..."
                              />
                            </div>
  
                            {/* Approver Role */}
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                              <Label htmlFor={UserRole.APPROVER} className="text-sm font-medium text-gray-700">Approver</Label>
                              <MultiSelectUsers
                                users={getAvailableUsersForRole(UserRole.APPROVER)}
                                selectedUsers={roleSelections[UserRole.APPROVER]}
                                onSelect={(selectedIds) => handleRoleSelection(UserRole.APPROVER, selectedIds)}
                                placeholder="Select approvers..."
                              />
                            </div>
  
                            {/* Vendor Role */}
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                              <Label htmlFor={UserRole.VENDOR} className="text-sm font-medium text-gray-700">Vendor</Label>
                              <MultiSelectUsers
                                users={getAvailableUsersForRole(UserRole.VENDOR)}
                                selectedUsers={roleSelections[UserRole.VENDOR]}
                                onSelect={(selectedIds) => handleRoleSelection(UserRole.VENDOR, selectedIds)}
                                placeholder="Select vendors..."
                              />
                            </div>
  
                            {/* Participant Role */}
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                              <Label htmlFor={UserRole.PARTICIPANT} className="text-sm font-medium text-gray-700">Participant</Label>
                              <MultiSelectUsers
                                users={getAvailableUsersForRole(UserRole.PARTICIPANT)}
                                selectedUsers={roleSelections[UserRole.PARTICIPANT]}
                                onSelect={(selectedIds) => handleRoleSelection(UserRole.PARTICIPANT, selectedIds)}
                                placeholder="Select participants..."
                              />
                            </div>
  
                            {/* Client Role + Logo Upload */}
                            <div className="rounded-lg bg-white p-4 shadow-sm col-span-full">
                              <div className="flex flex-col md:flex-row items-start">
                                <div className="flex-grow mr-6 w-full md:w-3/4">
                                  <Label htmlFor={UserRole.CLIENT} className="text-sm font-medium text-gray-700">Client</Label>
                                  <MultiSelectUsers
                                    users={getAvailableUsersForRole(UserRole.CLIENT)}
                                    selectedUsers={roleSelections[UserRole.CLIENT]}
                                    onSelect={(selectedIds) => handleRoleSelection(UserRole.CLIENT, selectedIds)}
                                    placeholder="Select clients..."
                                  />
                                </div>
                                <div className="mt-4 md:mt-0 w-full md:w-1/4">
                                  <Label className="text-sm font-medium text-gray-700 block mb-2">Client Logo</Label>
                                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-2 transition-colors hover:border-gray-400">
                                    <ImageUpload
                                      initialImage={projectLogo}
                                      onUploadSuccess={handleLogoUpload}
                                      handleLogoRemove={handleLogoRemove}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={isLoadingCreation} 
                        className="w-full text-white hover:text-black sm:w-auto py-2 px-4 bg-[#127285]"
                      >
                        {(isLoadingCreation || isLoadingUsers) && (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        )}
                        Create Project
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
  
        {/* Projects Table with improved loading state */}
        <div className="rounded-xl bg-white shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-gray-50">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <DataTable
                columns={columns}
                data={projects as ProjectType[]}
                searchKey="title"
                searchPlaceholder="Search projects..."
                onRowClick={handleRowClick}
                pagination={{
                  pageCount,
                  currentPage,
                  onPageChange: goToPage,
                }}
              />
            </div>
          )}
        </div>
        
        {/* Profile completion modal */}
        {currentUser && !currentUser.profile_complete && (
          <ProfileCompletionModal />
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
