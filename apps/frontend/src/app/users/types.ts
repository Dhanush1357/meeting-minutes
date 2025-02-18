export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  CREATOR = "CREATOR",
  REVIEWER = "REVIEWER",
  APPROVER = "APPROVER",
  CLIENT = "CLIENT",
  VENDOR = "VENDOR",
  PARTICIPANT = "PARTICIPANT",
}

export type CurrentUserType = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_complete: boolean;
};
