"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Calendar,
  Users,
  Pencil,
  Lock,
  ArrowUpDown,
  Menu,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { MoMType } from "./types";
import { UserRole } from "@/app/users/types";
import { ProjectStatusType, ProjectType } from "../types";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import TeamMembersSection from "./teamMembers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MoMForm from "./mom/momForm";
import { usePagination } from "@/hooks/usePagination";
import { fetchMoms, getStatusColor } from "./mom/utils";
import { DataTable } from "@/components/DataTable";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MomStatusLabels } from "./mom/constants";
import { formatDate } from "@/lib/utils";
import { hasProjectRole } from "./utils";

const ProjectDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("moms");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useAuthStore();

  const {
    data: moms,
    loading,
    pageCount,
    currentPage,
    goToPage,
    meta,
    refetch,
    updateParams,
  } = usePagination({
    fetchFn: fetchMoms,
    initialParams: { projectId: params.id },
    pageSize: 10,
  });

  const isMoMCreator =
    (currentUser?.role === UserRole.SUPER_ADMIN ||
      hasProjectRole(project?.user_roles, Number(currentUser?.id), [
        UserRole.CREATOR,
      ])) &&
    project?.status != ProjectStatusType.CLOSED;

  useEffect(() => {
    const tabToOpen = localStorage.getItem("projectTabToOpen");
    const loadProjects = async () => {
      try {
        const projectData = await apiFactory(
          `${API_ENDPOINTS.PROJECTS.BASE}/${params.id}`,
          { method: "GET" }
        );
        setProject(projectData as ProjectType);
      } catch (err) {
        toast.error("Failed to load project details");
      } finally {
        updateParams({ projectId: params.id });
      }
    };
    loadProjects();
    if (tabToOpen) {
      setActiveTab(tabToOpen);
      // Clear the flag after using it
      localStorage.removeItem("projectTabToOpen");
    }
  }, [params.id]);

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const updatedProjectData = {
        title: formData.get("title"),
      };

      await apiFactory(`${API_ENDPOINTS.PROJECTS.BASE}/${project?.id}`, {
        method: "PATCH",
        body: updatedProjectData,
      });
      setProject((prev: any) =>
        prev ? { ...prev, ...updatedProjectData } : null
      );
      setIsEditOpen(false);
      toast.success("Project updated successfully");
    } catch (err) {
      toast.error("Failed to update project");
    } finally {
    }
  };

  const handleCloseProject = async () => {
    try {
      setCloseLoading(true);
      await apiFactory(`${API_ENDPOINTS.PROJECTS.BASE}/${project?.id}/close`, {
        method: "POST",
      });

      setProject((prev: any) => (prev ? { ...prev, status: "CLOSED" } : null));
      setIsCloseOpen(false);
      toast.success("Project closed successfully");
    } catch (err) {
      toast.error("Failed to close project");
    } finally {
      setCloseLoading(false);
    }
  };

  const handleCreateMoM = async (formData: MoMFormData) => {
    try {
      setSubmissionLoading(true);
      // Make sure reference_mom_ids is formatted correctly
      let reference_mom_ids = undefined;
      if (formData.reference_mom_ids && formData.reference_mom_ids.length > 0) {
        // Make sure all IDs are properly parsed as numbers if needed
        reference_mom_ids = formData.reference_mom_ids.map((id: any) =>
          typeof id === "string" ? parseInt(id, 10) : id
        );
      }
      const momData = {
        ...formData,
        reference_mom_ids: reference_mom_ids,
        project_id: project?.id,
      };

      await apiFactory(`${API_ENDPOINTS.MOM.BASE}`, {
        method: "POST",
        body: momData,
      });
      setIsOpen(false);
      toast.success("MoM created successfully");
    } catch (err) {
      toast.error("Failed to create MoM");
    } finally {
      refetch();
      setSubmissionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const columns: ColumnDef<MoMType>[] = [
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
          className={getStatusColor(row.original.status)}
        >
          {MomStatusLabels[row.original.status]}
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

  const handleRowClick = (mom: MoMType) => {
    router.push(`/projects/${params.id}/mom/${mom.id}`);
  };

  return (
    <div className=" bg-gray-50 min-h-screen">
      {/* Project Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden absolute top-0 right-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>

            {/* Mobile Actions Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-12 right-0 bg-white border rounded-lg shadow-lg z-50 p-2 space-y-2">
                {currentUser?.role === UserRole.SUPER_ADMIN &&
                  project?.status !== "CLOSED" && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsEditOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Pencil className="mr-2 h-5 w-5" />
                        Edit Title
                      </Button>
                      {project?.status === "OPEN" && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            setIsCloseOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Lock className="mr-2 h-5 w-5" />
                          Mark as Closed
                        </Button>
                      )}
                    </>
                  )}
              </div>
            )}

            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 sm:truncate mb-2 sm:mb-0">
                    {project?.title}
                  </h1>
                  <div className="hidden md:block space-x-2">
                    {currentUser?.role === UserRole.SUPER_ADMIN &&
                      project?.status !== "CLOSED" && (
                        <>
                          <Dialog
                            open={isEditOpen}
                            onOpenChange={setIsEditOpen}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Pencil className="mr-2 h-5 w-5" />
                                Edit Title
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Project Title</DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={handleUpdateProject}
                                className="space-y-6"
                              >
                                <div>
                                  <Label htmlFor="title">Project Title</Label>
                                  <Input
                                    id="title"
                                    name="title"
                                    defaultValue={project?.title}
                                    required
                                  />
                                </div>
                                <DialogFooter>
                                  <Button type="submit" disabled={loading}>
                                    {loading && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Update Project
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                          {project?.status === "OPEN" && (
                            <Dialog
                              open={isCloseOpen}
                              onOpenChange={setIsCloseOpen}
                            >
                              <DialogTrigger asChild>
                                <Button variant="destructive">
                                  <Lock className="mr-2 h-5 w-5" />
                                  Mark as Closed
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Close Project</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to close this project?
                                    This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={handleCloseProject}
                                    disabled={closeLoading}
                                  >
                                    {closeLoading && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Close Project
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                  </div>
                </div>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-500">
                    <Users className="mr-1.5 h-4 w-4" />
                    <span className="truncate">
                      Created by {project?.created_by?.first_name}{" "}
                      {project?.created_by?.last_name}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-500">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    <span className="truncate">
                      Created on{" "}
                      {new Date(project?.created_at || "").toLocaleString()}
                    </span>
                  </div>
                  <Badge
                    className={`mt-2 text-xs sm:text-sm ${project?.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {project?.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="moms">Minutes of Meetings</TabsTrigger>
            <TabsTrigger value="team">Assigned Members</TabsTrigger>
          </TabsList>

          <TabsContent value="moms">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
                  Minutes of Meetings
                </h2>
                {isMoMCreator && project?.status !== "CLOSED" && (
                  <MoMForm
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    project={project}
                    loading={submissionLoading}
                    onSubmit={handleCreateMoM}
                  />
                )}
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={moms as MoMType[]}
                  searchKey="title"
                  searchPlaceholder="Search MoM's..."
                  onRowClick={handleRowClick}
                  pagination={{
                    pageCount,
                    currentPage,
                    onPageChange: goToPage,
                  }}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Assigned Members
              </h2>
              <TeamMembersSection project={project} setProject={setProject} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
