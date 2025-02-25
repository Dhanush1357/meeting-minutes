import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import toast from "react-hot-toast";

export const fetchMoms = async (
  params: { projectId: number },
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    const { projectId } = params;
    const response: any = await apiFactory(
      `${API_ENDPOINTS.MOM.BASE}?project_id=${projectId}&page=${page}&limit=${pageSize}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (err) {
    toast.error(`Failed to fetch projects: ${err}`);
    return [];
  }
};

export const fetchAllMoms = async (projectId: number) => {
  try {
    // First fetch to get total count and metadata
    const initialResponse: any = await apiFactory(
      `${API_ENDPOINTS.MOM.BASE}?project_id=${projectId}&page=1&limit=30`,
      {
        method: "GET",
      }
    );

    const totalCount = initialResponse?.meta?.total || 0;
    const pageSize = 30;
    const totalPages = Math.ceil(totalCount / pageSize);

    // If only one page is needed, return that data
    if (totalPages <= 1) {
      return initialResponse.data || [];
    }

    // Create an array of promises for all pages
    const pagePromises = [];
    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(
        apiFactory(
          `${API_ENDPOINTS.MOM.BASE}?project_id=${projectId}&page=${page}&limit=${pageSize}`,
          {
            method: "GET",
          }
        )
      );
    }

    // Wait for all pages to load
    const responses = await Promise.all(pagePromises);

    // Combine all mom from all pages
    const allMoms = responses.flatMap((response: any) => response?.data || []);

    return allMoms;
  } catch (err) {
    toast.error(`Failed to fetch mom: ${err}`);
    return [];
  }
};


export const getStatusColor = (status: string) => {
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
