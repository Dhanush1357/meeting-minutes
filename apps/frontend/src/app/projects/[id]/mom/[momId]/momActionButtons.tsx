import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, XCircle, AlertTriangle, PencilIcon } from "lucide-react";
import toast from "react-hot-toast";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { hasProjectRole } from "../../utils";
import { UserRole } from "@/app/users/types";

interface MoMActionButtonsProps {
  momId: string | number;
  status: string;
  userRole: any;
  currentUser: any;
  onStatusUpdate: () => void;
  projectId: any;
}

const MoMActionButtons: React.FC<MoMActionButtonsProps> = ({
  momId,
  status,
  userRole,
  currentUser,
  onStatusUpdate,
  projectId,
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showUserListDialog, setShowUserListDialog] = useState(false);
  const [rejectComments, setRejectComments] = useState("");
  const [rejectionType, setRejectionType] = useState<"reviewer" | "approver">(
    "reviewer"
  );

  const handleAction = async (endpoint: string) => {
    try {
      setLoading(true);
      await apiFactory(`${API_ENDPOINTS.MOM.BASE}/${momId}/${endpoint}`, {
        method: "POST",
      });
      toast.success("Status updated successfully");
      onStatusUpdate();
      setShowUserListDialog(false);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComments.trim()) {
      toast.error("Please provide rejection comments");
      return;
    }

    const endpoint =
      rejectionType === "reviewer" ? "reject-review" : "reject-approval";
    try {
      setLoading(true);
      await apiFactory(`${API_ENDPOINTS.MOM.BASE}/${momId}/${endpoint}`, {
        method: "POST",
        body: { comments: rejectComments },
      });
      toast.success("Sent back for revision");
      setShowRejectDialog(false);
      setRejectComments("");
      onStatusUpdate();
    } catch (error) {
      toast.error("Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  const showCreatorActions =
    status === "CREATED" &&
    (hasProjectRole(userRole, currentUser?.id, [UserRole.CREATOR]) ||
      currentUser?.role === UserRole.SUPER_ADMIN);
  const showReviewerActions =
    status === "IN_REVIEW" &&
    (hasProjectRole(userRole, currentUser?.id, [UserRole.REVIEWER]) ||
      currentUser?.role === UserRole.SUPER_ADMIN);
  const showApproverActions =
    status === "AWAITING_APPROVAL" &&
    (hasProjectRole(userRole, currentUser?.id, [UserRole.APPROVER]) ||
      currentUser?.role === UserRole.SUPER_ADMIN);

  const projectUsers =
    userRole?.filter((role: any) => {
      return role?.user;
    }) || [];

  return (
    <>
      <div className="flex gap-4">
        {/* Creator Actions */}
        {showCreatorActions && (
          <Button
            onClick={() => handleAction("send-review")}
            disabled={loading}
            className=""
          >
            <Send className="mr-2 h-4 w-4" />
            Send for Review
          </Button>
        )}

        {/* Reviewer Actions */}
        {showReviewerActions && (
          <>
            <Button
              onClick={() => handleAction("send-approval")}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Send for Approval
            </Button>
            <Button
              onClick={() => {
                setRejectionType("reviewer");
                setShowRejectDialog(true);
              }}
              disabled={loading}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Send Back for Revision
            </Button>
          </>
        )}

        {/* Approver Actions */}
        {showApproverActions && (
          <>
            <Button
              onClick={() => setShowUserListDialog(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => {
                setRejectionType("approver");
                setShowRejectDialog(true);
              }}
              disabled={loading}
              variant="destructive"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Revision
            </Button>
          </>
        )}
      </div>

      {/* User List Dialog */}
      <Dialog open={showUserListDialog} onOpenChange={setShowUserListDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Project Assigned Members</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = `/projects/${projectId}`;
                  localStorage.setItem("projectTabToOpen", "team");
                }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Team
              </Button>
            </DialogTitle>
            <DialogDescription>
              These users are attached to the project and will be notified about
              the approval.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {projectUsers.length > 0 ? (
              <div className="space-y-4">
                {/* Group users by role */}
                {(() => {
                  // Create a map of roles to users
                  const roleMap = projectUsers.reduce((acc: any, role: any) => {
                    const userRole = role?.role || "Unknown";
                    if (!acc[userRole]) {
                      acc[userRole] = [];
                    }
                    acc[userRole].push(role);
                    return acc;
                  }, {});

                  // Render each role group
                  return Object.entries(roleMap).map(
                    ([roleName, users]: [string, any]) => (
                      <div
                        key={roleName}
                        className="border rounded-md overflow-hidden"
                      >
                        <div className="bg-gray-100 px-3 py-2 font-medium">
                          {roleName}
                        </div>
                        <div className="divide-y">
                          {users.map((role: any, index: any) => {
                            const firstName = role?.user?.first_name || "";
                            const lastName = role?.user?.last_name || "";
                            const fullName = `${firstName} ${lastName}`;

                            return (
                              <div
                                key={index}
                                className="p-3 flex items-center"
                              >
                                <div>
                                  <p className=" text-xs font-normal">
                                    {fullName}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No users found for this project
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUserListDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("approve")}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provide Revision Comments</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your comments for revision..."
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              Send for Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoMActionButtons;
