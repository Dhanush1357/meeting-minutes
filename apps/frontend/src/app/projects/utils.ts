import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import toast from "react-hot-toast";
import { ProjectStatusType } from "./types";


export const fetchProjects = async () => {
  try {
    const response = await apiFactory(API_ENDPOINTS.PROJECTS.BASE, {
      method: "GET",
    });
    return Array.isArray(response) ? response : [];
  } catch (err) {
    toast.error(`Failed to fetch projects: ${err}`);
    return [];
  }
};

export const getProjectStatusBadgeColor = (status: ProjectStatusType) => {
  const colors = {
    OPEN: "bg-green-100 text-green-800",
    CLOSED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};