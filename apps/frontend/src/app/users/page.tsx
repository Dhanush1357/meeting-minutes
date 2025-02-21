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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Loader2,
  Mail,
  UserCheck,
  UserX,
  ArrowUpDown,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import toast from "react-hot-toast";
import { formatDate, generateRandomPassword } from "@/lib/utils";
import { UserRoleLabels } from "./constants";
import { UserRole } from "./types";
import { fetchUsers } from "./utils";
import { Switch } from "@/components/ui/switch";

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
  is_active: boolean;
  profile_complete: boolean;
  projects: any[];
  created_projects: any[];
}

const UsersPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleEditUser = async (formData: FormData) => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const updateData = {
        role: formData.get("role") as UserRole,
        is_active: formData.get("is_active") === "on",
      };
      await apiFactory(`${API_ENDPOINTS.USERS.UPDATE_PROFILE}${selectedUser.id}`, {
        method: "PATCH",
        body: updateData,
      });

      toast.success("User updated successfully");
      setIsEditOpen(false);
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (err) {
      toast.error(`Failed to update user: ${err}`);
    } finally {
      setUpdating(false);
    }
  };

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span>
          {row.original.first_name} {row.original.last_name}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" /> {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const getRoleBadgeColor = (role: UserRole) => {
          const colors = {
            SUPER_ADMIN: "bg-red-100 text-red-800",
            CREATOR: "bg-blue-100 text-blue-800",
            REVIEWER: "bg-purple-100 text-purple-800",
            APPROVER: "bg-green-100 text-green-800",
            CLIENT: "bg-yellow-100 text-yellow-800",
            VENDOR: "bg-orange-100 text-orange-800",
            PARTICIPANT: "bg-gray-100 text-gray-800",
          };
          return colors[role] || "bg-gray-100 text-gray-800";
        };

        return (
          <Badge
            variant="secondary"
            className={getRoleBadgeColor(row.original.role)}
          >
            {UserRoleLabels[row.original.role]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.is_active ? (
            <UserCheck className="text-green-500" />
          ) : (
            <UserX className="text-red-500" />
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedUser(row.original);
            setIsEditOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleInviteUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setLoading(true);
      const userData = {
        email: formData.get("email"),
        role: UserRole[formData.get("role") as keyof typeof UserRole],
        password: generateRandomPassword(),
      };

      await apiFactory(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        body: userData,
      });

      toast.success("User invited successfully");
      setIsOpen(false);
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (err) {
      toast.error(`Failed to invite user: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const usersData = await fetchUsers();
      setUsers(usersData);
      setLoading(false);
    };
    loadUsers();
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
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          </div>

          {currentUser?.role === "SUPER_ADMIN" && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInviteUser} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(UserRole)
                            .filter((role) => role !== UserRole.SUPER_ADMIN)
                            .map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <DataTable
          columns={columns}
          data={users ?? []}
          searchKey="email"
          searchPlaceholder="Search users..."
        />

        {/* Edit User Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px] p-6">
            <DialogHeader className="space-y-3 pb-4 border-b">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Edit User
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Update user role and status. Changes will take effect
                immediately.
              </p>
            </DialogHeader>

            <form
              action={(formData) => handleEditUser(formData)}
              className="space-y-6 py-4"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-500">
                    {selectedUser?.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                  >
                    Role
                  </Label>
                  <Select
                    name="role"
                    defaultValue={selectedUser?.role}
                    required
                  >
                    <SelectTrigger className="w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {Object.values(UserRole)
                        .filter((role) => role !== UserRole.SUPER_ADMIN)
                        .map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              {UserRoleLabels[role]}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label
                      htmlFor="is_active"
                      className="text-sm font-medium text-gray-700"
                    >
                      Active Status
                    </Label>
                    <p className="text-sm text-gray-500">
                      {selectedUser?.is_active
                        ? "User can access the system"
                        : "User access is disabled"}
                    </p>
                  </div>
                  <Switch
                    name="is_active"
                    defaultChecked={selectedUser?.is_active}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <div className="flex gap-3 justify-end w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="min-w-[100px]"
                  >
                    {updating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UsersPage;
