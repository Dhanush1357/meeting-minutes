"use client";

import React, { useState } from "react";
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
  PlusCircle,
  Loader2,
  Mail,
  UserCheck,
  UserX,
  ArrowUpDown,
  Edit,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import toast from "react-hot-toast";
import { formatDate, generateRandomPassword } from "@/lib/utils";
import { UserRole } from "./types";
import { fetchUsers } from "./utils";
import { Switch } from "@/components/ui/switch";
import { usePagination } from "@/hooks/usePagination";

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
  const {
    data: users,
    loading,
    pageCount,
    currentPage,
    goToPage,
    meta,
    refetch,
  } = usePagination({
    fetchFn: fetchUsers,
    pageSize: 10,
  });

  const { currentUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleEditUser = async (formData: FormData) => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const updateData = {
        is_active: formData.get("is_active") === "on",
      };
      await apiFactory(
        `${API_ENDPOINTS.USERS.UPDATE_PROFILE}${selectedUser.id}`,
        {
          method: "PATCH",
          body: updateData,
        }
      );

      toast.success("User updated successfully");
      setIsEditOpen(false);
      await refetch();
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
      setIsInviteLoading(true);
      const userData = {
        email: formData.get("email"),
        password: generateRandomPassword(),
      };

      await apiFactory(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        body: userData,
      });

      toast.success("User invited successfully");
      await refetch();
      setIsOpen(false);
    } catch (err) {
      setIsInviteLoading(false);
      toast.error(`Failed to invite user: ${err}`);
    } finally {
      setIsInviteLoading(false);
      form.reset();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-1 py-8 sm:px-3 lg:px-8">
        <div className="relative mb-8 rounded-2xl bg-white px-6 py-3 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Users</h1>
          </div>

          {currentUser?.role === UserRole.SUPER_ADMIN && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="group relative overflow-hidden bg-primary transition-all hover:bg-primary/90" size="lg">
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
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isInviteLoading}>
                      {isInviteLoading && (
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users as User[]}
            searchKey="email"
            searchPlaceholder="Search users..."
            pagination={{
              pageCount,
              currentPage,
              onPageChange: goToPage,
            }}
          />
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px] p-6">
            <DialogHeader className="space-y-3 pb-4 border-b">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Edit User
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Update user. Changes will take effect
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
