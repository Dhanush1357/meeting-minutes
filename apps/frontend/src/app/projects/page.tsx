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
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { formatDate } from "@/lib/utils";
import { UserRole } from "../users/types";
import { ProjectType } from "./types";
import { CurrentUserType } from "../users/types";
import { fetchUsers } from "../users/utils";
import { fetchProjects, getProjectStatusBadgeColor } from "./utils";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusLabels } from "./constants";
import { MultiSelectUsers } from "@/components/MultiSelectUser";
import Link from "next/link";


interface UserSelections {
  [UserRole.REVIEWER]: string[];
  [UserRole.APPROVER]: string[];
  [UserRole.CLIENT]: string[];
  [UserRole.VENDOR]: string[];
  [UserRole.PARTICIPANT]: string[];
}
type UserRoleKeys = Exclude<UserRole, UserRole.SUPER_ADMIN>;


const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [users, setUsers] = useState<CurrentUserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuthStore();

  const [userSelections, setUserSelections] = useState<UserSelections>({
    [UserRole.REVIEWER]: [],
    [UserRole.APPROVER]: [],
    [UserRole.CLIENT]: [],
    [UserRole.VENDOR]: [],
    [UserRole.PARTICIPANT]: [],
  });

  const handleUserSelectionChange = (role: UserRoleKeys, selectedIds: string[]) => {
    setUserSelections((prev) => ({
      ...prev,
      [role]: selectedIds,
    }));
  };

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setLoading(true);
      // Transform selections into the format expected by CategoriesOnProjects
      const userRoles = Object.entries(userSelections).flatMap(
        ([role, userIds]) =>
          userIds.map((userId: string) => ({
            user_id: parseInt(userId),
            role: role as UserRole,
            assigned_by: currentUser?.id || "System",
          }))
      );

      const projectData = {
        title: formData.get("title"),
        creator_id: currentUser?.id,
        user_roles: userRoles,
      };
      console.log("Project data:", projectData);
      await apiFactory(API_ENDPOINTS.PROJECTS.BASE, {
        method: "POST",
        body: projectData,
      });

      const updatedProjects = await apiFactory(API_ENDPOINTS.PROJECTS.BASE, {
        method: "GET",
      });
      setProjects(updatedProjects as ProjectType[]);
      setIsOpen(false);
      setUserSelections({
        [UserRole.REVIEWER]: [],
        [UserRole.APPROVER]: [],
        [UserRole.CLIENT]: [],
        [UserRole.VENDOR]: [],
        [UserRole.PARTICIPANT]: [],
      });
    } catch (err) {
      toast.error("Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setLoading(true);
        const usersData = await fetchUsers();
        setUsers(usersData);
        setLoading(false);
      };
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const projectsData = await fetchProjects();
      setProjects(projectsData);
      setLoading(false);
    };
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          </div>

          {currentUser?.role === UserRole.SUPER_ADMIN && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProject} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter project title"
                        required
                      />
                    </div>
                    {/* Get unique roles from users array excluding SUPER_ADMIN */}
                    {Array.from(new Set(users.map((user) => user.role)))
                      .filter((role): role is UserRoleKeys => role !== UserRole.SUPER_ADMIN)
                      .map((role) => {
                        // Filter users for this specific role
                        const roleUsers = users.filter(
                          (user) => user.role === role
                        );

                        // Only render if there are users with this role
                        return roleUsers.length > 0 ? (
                          <div key={role}>
                            <Label>{role}'s</Label>
                            <MultiSelectUsers
                              users={roleUsers}
                              selectedUsers={userSelections[role as keyof UserSelections] || []}
                              onSelect={(selectedIds) =>
                                handleUserSelectionChange(role, selectedIds)
                              }
                              placeholder={`Select ${role.toLowerCase()}s...`}
                            />
                          </div>
                        ) : null;
                      })}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Project
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects && projects.length > 0 ? (
              projects.map((project: ProjectType) => (
                <Link href={`/projects/${project.id}`} legacyBehavior className="cursor-pointer hover:bg-gray-100" key={project.id}>
                <TableRow key={project.id}>
                  <TableCell>{project.id}</TableCell>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getProjectStatusBadgeColor(project.status)}
                    >
                      {ProjectStatusLabels[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(project.created_at)}</TableCell>
                </TableRow>
                </Link>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProjectsPage;
