import { CurrentUserType } from "@/app/users/types";

interface MoMItem {
  text: string;
  completed: boolean;
}

// Main MoM interface
export interface MoMType {
  id: number;
  created_at: string;
  updated_at: string | null;
  is_active: boolean;
  creator_id: number;
  title: string;
  status: MoMStatus;
  completion_date: string | null;
  place: string;
  discussion: MoMItem[];
  open_issues: MoMItem[];
  updates: MoMItem[];
  notes: MoMItem[];
  project_id: number;
  reference_mom_id: number | null;
  mom_number: number | null;
  created_by: CurrentUserType
}

export enum MoMStatus {
  CREATED = "CREATED",
  IN_REVIEW = "IN_REVIEW",
  AWAITING_APPROVAL = "AWAITING_APPROVAL",
  APPROVED = "APPROVED",
  NEEDS_REVISION = "NEEDS_REVISION",
  CLOSED = "CLOSED",
}
