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
  PlusCircle,
  Loader2,
  Calendar,
  Users,
  Pencil,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { MoMType } from "./types";
import { UserRole } from "@/app/users/types";
import { ProjectType } from "../types";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import TeamMembersSection from "./teamMembers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MoMPreviewList from "./mom/momPreview";
import MoMForm from "./mom/momForm";

const ProjectDetailPage: React.FC = () => {
  const params = useParams();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [moms, setMoms] = useState<MoMType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const { currentUser } = useAuthStore();

  const isMoMCreator =
    currentUser?.role === UserRole.CREATOR ||
    currentUser?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const loadProjectAndMoMs = async () => {
      try {
        setLoading(true);
        const projectData = await apiFactory(
          `${API_ENDPOINTS.PROJECTS.BASE}/${params.id}`,
          { method: "GET" }
        );
        setProject(projectData as ProjectType);

        const momsData: any = await apiFactory(
          `${API_ENDPOINTS.MOM.BASE}?project_id=${params.id}`,
          { method: "GET" }
        );
        setMoms(momsData?.data as MoMType[]);
      } catch (err) {
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    loadProjectAndMoMs();
  }, [params.id]);

  const handleCreateMoM = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setLoading(true);
      const momData = {
        title: formData.get("title"),
        completion_date: formData.get("completion_date"),
        agenda: formData.get("agenda"),
        project_id: project?.id,
        creator_id: currentUser?.id,
      };

      await apiFactory(`${API_ENDPOINTS.PROJECTS.BASE}/${project?.id}/moms`, {
        method: "POST",
        body: momData,
      });

      const updatedMoMs = await apiFactory(
        `${API_ENDPOINTS.PROJECTS.BASE}/${project?.id}/moms`,
        { method: "GET" }
      );
      setMoms(updatedMoMs as MoMType[]);
      setIsOpen(false);
      toast.success("MoM created successfully");
    } catch (err) {
      toast.error("Failed to create MoM");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      setLoading(true);
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
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 sm:truncate">
                  {project?.title}
                </h1>
                {currentUser?.role === UserRole.SUPER_ADMIN &&
                  project?.status !== "CLOSED" && (
                    <div className="space-x-2">
                      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Pencil className="mr-2 h-5 w-5" />
                            Edit Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
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
                    </div>
                  )}
              </div>
              <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Users className="mr-1.5 h-4 w-4" />
                  Created by {project?.created_by?.first_name}{" "}
                  {project?.created_by?.last_name}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Created on{" "}
                  {new Date(project?.created_at || "").toLocaleDateString()}
                </div>
                <Badge
                  className={`mt-2 ${project?.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {project?.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="moms" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="moms">Minutes of Meetings</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="moms">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Minutes of Meetings
                </h2>
                {isMoMCreator && project?.status !== "CLOSED" && (
                  <MoMForm
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    loading={loading}
                    onSubmit={handleCreateMoM}
                  />
                )}
              </div>
              <MoMPreviewList moms={moms} isMoMCreator={isMoMCreator} />
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
              <TeamMembersSection project={project} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
