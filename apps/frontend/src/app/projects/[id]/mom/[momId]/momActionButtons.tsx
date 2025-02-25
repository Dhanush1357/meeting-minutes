import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { hasProjectRole } from '../../utils';
import { UserRole } from '@/app/users/types';

interface MoMActionButtonsProps {
  momId: string | number;
  status: string;
  userRole: any;
  currentUser: any;
  onStatusUpdate: () => void;
}

const MoMActionButtons: React.FC<MoMActionButtonsProps> = ({
  momId,
  status,
  userRole,
  currentUser,
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComments, setRejectComments] = useState("");
  const [rejectionType, setRejectionType] = useState<"reviewer" | "approver">("reviewer");

  const handleAction = async (endpoint: string) => {
    try {
      setLoading(true);
      await apiFactory(`${API_ENDPOINTS.MOM.BASE}/${momId}/${endpoint}`, {
        method: "POST"
      });
      toast.success("Status updated successfully");
      onStatusUpdate();
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

    const endpoint = rejectionType === "reviewer" ? "reject-review" : "reject-approval";
    try {
      setLoading(true);
      await apiFactory(`${API_ENDPOINTS.MOM.BASE}/${momId}/${endpoint}`, {
        method: "POST",
        body: { comments: rejectComments }
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

  const showCreatorActions = status === "CREATED" && (hasProjectRole(userRole, currentUser?.id, [UserRole.CREATOR]) || currentUser?.role === UserRole.SUPER_ADMIN);
  const showReviewerActions = status === "IN_REVIEW" && (hasProjectRole(userRole, currentUser?.id, [UserRole.REVIEWER]) || currentUser?.role === UserRole.SUPER_ADMIN);
  const showApproverActions = status === "AWAITING_APPROVAL" && (hasProjectRole(userRole, currentUser?.id, [UserRole.APPROVER]) || currentUser?.role === UserRole.SUPER_ADMIN);

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
              onClick={() => handleAction("approve")}
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

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
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