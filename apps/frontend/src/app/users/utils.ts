import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import toast from "react-hot-toast";

export const fetchUsers = async () => {
  try {
    const response: any = await apiFactory(API_ENDPOINTS.USERS.BASE, {
      method: "GET",
    });
    return Array.isArray(response?.data) ? response?.data : [];
  } catch (err) {
    toast.error(`Failed to fetch users: ${err}`);
    return [];
  }
};