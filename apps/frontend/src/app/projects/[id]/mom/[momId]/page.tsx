"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Calendar,
  Users,
  XCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Ban
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { MoMType } from "../../types";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MoMForm from "../momForm";
import { Button } from "@/components/ui/button";
import MoMActionButtons from "./momActionButtons";

const MoMDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [mom, setMoM] = useState<MoMType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const { currentUser } = useAuthStore();

  const loadMoM = async () => {
    try {
      setLoading(true);
      const momData = await apiFactory(
        `${API_ENDPOINTS.MOM.BASE}/${params.momId}`,
        {
          method: "GET",
        }
      );
      setMoM(momData as MoMType);
    } catch (err) {
      toast.error("Failed to load MoM details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoM();
  }, [params.id]);

  const handleEditSubmit = async (formData: any) => {
    try {
      setLoading(true);
      await apiFactory(`${API_ENDPOINTS.MOM.BASE}/${params.id}`, {
        method: "PATCH",
        body: formData,
      });
      toast.success("MoM updated successfully");
      setIsEditMode(false);
    } catch (err) {
      toast.error("Failed to update MoM");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMom = async () => {
    try {
      setLoading(true);
      await apiFactory(`${API_ENDPOINTS.MOM.BASE}/${mom?.id}/close`, {
        method: "POST"
      });
      toast.success("Status updated successfully");
      loadMoM();
      setLoading(false);
    } catch (error) {
      toast.error("Failed to update status");
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

  if (!mom) {
    return <div className="text-center text-red-500">MoM not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-purple-100 text-purple-800";
      case "AWAITING_APPROVAL":
        return "bg-orange-100 text-orange-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "NEEDS_REVISION":
        return "bg-red-100 text-red-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const initialFormData: any = {
    title: mom.title,
    completion_date: mom.completion_date,
    place: mom.place,
    discussion: mom.discussion,
    open_issues: mom.open_issues,
    updates: mom.updates,
    notes: mom.notes || [],
    status: mom.status || "CREATED",
    creator: mom.creator_id,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {isEditMode ? (
        <MoMForm
          isOpen={isEditMode}
          setIsOpen={setIsEditMode}
          onSubmit={handleEditSubmit}
          initialData={initialFormData}
          editMode={true}
        />
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {mom.title}
                </CardTitle>
                <div className="flex gap-2">
                  {mom.status !== "CLOSED" && (
                    <Button
                      onClick={() => setIsEditMode(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {mom.status !== "CLOSED" && currentUser?.role === "CREATOR" && (
                    <Button
                      onClick={() => handleCloseMom()}
                      variant="outline"
                      className="flex items-center gap-2 bg-red-500 text-white"
                    >
                      <Ban className="h-4 w-4" />
                      Close MoM
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  {mom?.place}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Created on{" "}
                  {new Date(mom.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" /> Created by{" "}
                  {mom?.created_by?.first_name} {mom?.created_by?.last_name}
                </div>
              </div>
              <Badge className={getStatusColor(mom.status)}>{mom.status}</Badge>
              <div className="p-6">
                {/* Discussion Points */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Discussion Points
                  </h4>
                  <div className="space-y-2">
                    {mom?.discussion.map((point, index) => (
                      <div key={index} className="flex items-center">
                        {point.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span>{point.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open Issues */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Open Issues
                  </h4>
                  <div className="space-y-2">
                    {mom?.open_issues.map((issue, index) => (
                      <div key={index} className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span>{issue.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Updates */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Updates
                  </h4>
                  <div className="space-y-2">
                    {mom?.updates.map((update, index) => (
                      <div key={index} className="flex items-center">
                        {update.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span>{update.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <MoMActionButtons
                momId={mom.id}
                status={mom.status}
                userRole={currentUser?.role as string}
                onStatusUpdate={() => {
                  loadMoM();
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MoMDetailPage;
