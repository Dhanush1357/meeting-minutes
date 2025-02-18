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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { MoMType } from "./types";
import { UserRole } from "@/app/users/types";
import { ProjectType } from "../types";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

const ProjectDetailPage: React.FC = () => {
  const params = useParams();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [moms, setMoms] = useState<MoMType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuthStore();

  const isMoMCreator = currentUser?.role === UserRole.CREATOR;

  useEffect(() => {
    const loadProjectAndMoMs = async () => {
      try {
        setLoading(true);
        const projectData = await apiFactory(
          `${API_ENDPOINTS.PROJECTS.BASE}/${params.id}`,
          { method: "GET" }
        );
        setProject(projectData as ProjectType);

        // const momsData = await apiFactory(
        //   `${API_ENDPOINTS.PROJECTS.BASE}/${params.id}/mom`,
        //   { method: "GET" }
        // );
        // setMoms(momsData as MoMType[]);
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
      setMoms(updatedMoMs);
      setIsOpen(false);
      toast.success("MoM created successfully");
    } catch (err) {
      toast.error("Failed to create MoM");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{project?.title}</h1>
          <p className="mt-2 text-gray-600">Project ID: {project?.id}</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Minutes of Meetings</h2>
            {isMoMCreator && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create MoM
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Create New MoM</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateMoM} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">MoM Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="Enter MoM title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="completion_date">Completion Date</Label>
                        <Input
                          id="completion_date"
                          name="completion_date"
                          type="date"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="agenda">Agenda/Discussion Points</Label>
                        <Textarea
                          id="agenda"
                          name="agenda"
                          placeholder="Enter agenda and discussion points"
                          required
                          className="h-32"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create MoM
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="bg-white rounded-lg shadow">
            {moms.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {moms.map((mom) => (
                  <div key={mom.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{mom.title}</h3>
                        <p className="text-sm text-gray-500">
                          Completion Date: {new Date(mom.completion_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        // className={getMoMStatusBadgeColor(mom.status)}
                      >
                        {mom.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">
                      {mom.agenda}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No MoM's found for this project
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;