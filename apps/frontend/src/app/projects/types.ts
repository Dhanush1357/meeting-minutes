import { CurrentUserType, UserRole } from "../users/types";

export enum ProjectStatusType {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface ProjectType {
  id: number;
  created_at: string; // ISO 8601 date string
  updated_at: string | null; // ISO 8601 date string or null
  is_active: boolean;
  creator_id: number;
  created_by: CurrentUserType;
  title: string;
  status: ProjectStatusType;
  user_roles: CategoriesOnProjects[];
}

export interface CategoriesOnProjects {
  project_id: number;
  user_id: number;
  assigned_at: string; // ISO 8601 date string
  assigned_by: string;
  role: UserRole;
  project: ProjectType;
  user: CurrentUserType;
}
