import { useState } from "react";
import { ChevronRight, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MoMType } from "../types";

interface TeamMembersSectionProps {
  moms: MoMType[];
  isMoMCreator: boolean;
}

const MoMPreviewList: React.FC<TeamMembersSectionProps> = ({
  moms,
  isMoMCreator,
}) => {
  const router = useRouter();

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

  return (
    <div className="space-y-4">
      {moms.map((mom) => (
        <div
          key={mom.id}
          onClick={() => router.push(`/projects/${mom.project_id}/mom/${mom.id}`)}
          className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {mom.title}
                </h3>
                <Badge className={getStatusColor(mom.status)}>
                  {mom.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(mom.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {mom.discussion?.length || 0} points discussed
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      ))}

      {moms.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900">No MoM's yet</h3>
          {isMoMCreator && (
            <p className="text-sm text-gray-500 mt-1">
              Start by creating a new MoM using the "Create MoM" button.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MoMPreviewList;
