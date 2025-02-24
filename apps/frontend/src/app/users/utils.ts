import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import toast from "react-hot-toast";

export const fetchUsers = async ( _: {}, page: number = 1, pageSize: number = 10) => {
  try {
    const response: any = await apiFactory(
      `${API_ENDPOINTS.USERS.BASE}?page=${page}&limit=${pageSize}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (err) {
    toast.error(`Failed to fetch users: ${err}`);
    return [];
  }
};

export const fetchAllUsers = async () => {
  try {
    // First fetch to get total count and metadata
    const initialResponse: any = await apiFactory(
      `${API_ENDPOINTS.USERS.BASE}?page=1&limit=30`,
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
          `${API_ENDPOINTS.USERS.BASE}?page=${page}&limit=${pageSize}`,
          {
            method: "GET",
          }
        )
      );
    }

    // Wait for all pages to load
    const responses = await Promise.all(pagePromises);

    // Combine all users from all pages
    const allUsers = responses.flatMap((response: any) => response?.data || []);

    return allUsers;
  } catch (err) {
    toast.error(`Failed to fetch users: ${err}`);
    return [];
  }
};
