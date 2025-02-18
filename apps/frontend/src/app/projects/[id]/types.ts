export interface MoMType {
  id: number;
  title: string;
  completion_date: string;
  agenda: string;
  status: MoMStatus;
  created_at: string;
  creator_id: number;
  project_id: number;
}

export enum MoMStatus {
  CREATED = "CREATED",
  IN_REVIEW = "IN_REVIEW",
  AWAITING_APPROVAL = "AWAITING_APPROVAL",
  APPROVED = "APPROVED",
  NEEDS_REVISION = "NEEDS_REVISION",
  CLOSED = "CLOSED",
}
