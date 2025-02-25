"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, XCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Ban,
  Clock, Clipboard, ChevronDown,
  ChevronRight,
  NotebookPen
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { MoMType } from "../../types";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  Card, CardHeader,
  CardTitle
} from "@/components/ui/card";
import MoMForm from "../momForm";
import { Button } from "@/components/ui/button";
import MoMActionButtons from "./momActionButtons";
import MoMPDFDownload from "./momDownload";
import { getStatusColor } from "../utils";
import { UserRole } from "@/app/users/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDate } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  icon: React.FC<{ className?: string }>;
  items: Array<any>;
  renderItem: (item: any, index: number) => React.ReactNode;
  emptyMessage: string;
  defaultOpen?: boolean;
  iconColor: string;
}


// CollapsibleSection component to avoid repetition
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  items,
  renderItem,
  emptyMessage,
  defaultOpen = true,
  iconColor,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = icon;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger className="flex items-center w-full p-4 bg-gray-50 hover:bg-gray-100 text-left">
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
        )}
        <Icon className={`h-5 w-5 ${iconColor} mr-2`} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Badge variant="outline" className="ml-auto">
          {items?.length || 0}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-white">
        <div className="space-y-3">
          {items && items.length > 0 ? (
            items.map((item, index) => renderItem(item, index))
          ) : (
            <p className="text-gray-500 italic">{emptyMessage}</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

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
      const bodyData = {
        ...formData,
        project_id: mom?.project_id,
      };
      await apiFactory(`${API_ENDPOINTS.MOM.BASE}/${mom?.id}`, {
        method: "PATCH",
        body: bodyData,
      });
      toast.success("MoM updated successfully");
      setIsEditMode(false);
      loadMoM();
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
        method: "POST",
      });
      toast.success("Status updated successfully");
      loadMoM();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!mom) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Meeting Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The requested meeting does not exist or has been removed.
        </p>
      </div>
    );
  }

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
  const canEdit =
    mom.status !== "CLOSED" &&
    (currentUser?.role === UserRole.SUPER_ADMIN ||
      mom.creator_id === currentUser?.id);

  const canClose =
    mom.status !== "CLOSED" &&
    currentUser?.role === UserRole.SUPER_ADMIN &&
    mom.creator_id === currentUser?.id;

  // Render item functions for each section
  const renderDiscussionItem = (point: any, index: any) => (
    <div
      key={index}
      className={`flex items-start p-3 rounded-md ${
        point.completed ? "bg-green-50" : "bg-gray-50"
      }`}
    >
      {point.completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
      )}
      <span className="text-gray-700">{point.text}</span>
    </div>
  );

  const renderIssueItem = (issue: any, index: any) => (
    <div
      key={index}
      className={`flex items-start p-3 rounded-md ${
        issue.completed ? "bg-green-50" : "bg-amber-50"
      }`}
    >
      {issue.completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
      )}
      <span className="text-gray-700">{issue.text}</span>
    </div>
  );

  const renderUpdateItem = (update: any, index: any) => (
    <div
      key={index}
      className={`flex items-start p-3 rounded-md ${
        update.completed ? "bg-green-50" : "bg-indigo-50"
      }`}
    >
      {update.completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
      ) : (
        <Clock className="h-5 w-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" />
      )}
      <span className="text-gray-700">{update.text}</span>
    </div>
  );

  const renderNotesItem = (note: any, index: any) => (
    <div
      key={index}
      className={`flex items-start p-3 rounded-md`}
    >
      {note.completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
      )}
      <span className="text-gray-700">{note.text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {isEditMode ? (
        <MoMForm
          isOpen={isEditMode}
          setIsOpen={setIsEditMode}
          onSubmit={handleEditSubmit}
          initialData={initialFormData}
          editMode={true}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-lg border-0 bg-white rounded-xl mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
                    {mom.title}
                  </CardTitle>
                  <div className="ml-4">
                    <Badge
                      className={`${getStatusColor(mom.status)} text-sm py-1 px-3`}
                    >
                      {mom.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canEdit && (
                    <Button
                      onClick={() => setIsEditMode(true)}
                      variant="outline"
                      className="flex items-center gap-2 bg-white"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {canClose && (
                    <Button
                      onClick={() => handleCloseMom()}
                      variant="outline"
                      className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
                      size="sm"
                    >
                      <Ban className="h-4 w-4" />
                      Close MoM
                    </Button>
                  )}
                  <MoMPDFDownload mom={mom} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center text-gray-600 bg-white/60 p-2 rounded-md">
                  <MapPin className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">
                    {mom?.place || "No location specified"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 bg-white/60 p-2 rounded-md w-80">
                  <Clock className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span>
                    {mom.completion_date
                      ? `Completion: ${formatDate(mom.completion_date)}`
                      : "No due date"}
                  </span>
                </div>
              </div>
            </CardHeader>

            <div className="px-6 pt-4 pb-2 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">
                    Creator: {mom?.created_by?.first_name}{" "}
                    {mom?.created_by?.last_name}
                  </div>
                  <div className="text-sm">
                    Created: {formatDate(mom.created_at)}
                  </div>
                </div>
                <MoMActionButtons
                  momId={mom.id}
                  status={mom.status}
                  userRole={mom.project.user_roles}
                  currentUser={currentUser}
                  onStatusUpdate={() => loadMoM()}
                />
              </div>
            </div>
          </Card>

          {/* Collapsible Sections */}
          <div className="space-y-4 mb-6">
            <CollapsibleSection
              title="Discussion Points"
              icon={Clipboard}
              iconColor="text-blue-600"
              items={mom?.discussion || []}
              renderItem={renderDiscussionItem}
              emptyMessage="No discussion points recorded"
              defaultOpen={false}
            />

            <CollapsibleSection
              title="Open Issues"
              icon={AlertCircle}
              iconColor="text-amber-600"
              items={mom?.open_issues || []}
              renderItem={renderIssueItem}
              emptyMessage="No open issues"
              defaultOpen={mom?.open_issues?.length > 0}
            />

            <CollapsibleSection
              title="Updates"
              icon={Clock}
              iconColor="text-indigo-600"
              items={mom?.updates || []}
              renderItem={renderUpdateItem}
              emptyMessage="No updates available"
              defaultOpen={false}
            />

            <CollapsibleSection
              title="Notes"
              icon={NotebookPen}
              iconColor="text-indigo-600"
              items={mom?.notes || []}
              renderItem={renderNotesItem}
              emptyMessage="No Notes available"
              defaultOpen={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MoMDetailPage;
