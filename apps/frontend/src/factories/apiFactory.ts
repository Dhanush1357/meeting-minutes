import API_ENDPOINTS from "@/lib/apiEndpoints";
import { useAuthStore } from "@/stores/useAuthStore";

export interface ApiOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

const apiFactory = async <T>(
  endpoint: string,
  options: ApiOptions = { method: "GET" }
): Promise<T> => {
  try {
    // Get token from localStorage
    const token = useAuthStore.getState().token;

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method,
      headers,
      ...(options.body && { body: JSON.stringify(options.body) }),
    };

    const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}${endpoint}`, requestOptions);

    // Clone the response before reading it
    const responseClone = response.clone();

    // Try to parse as JSON first
    try {
      const data = await response.json();

      // If response is not ok, throw error with message from backend
      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data as T;
    } catch (parseError) {
      // If JSON parsing fails, try to get text content
      const textContent = await responseClone.text();

      // If response is not ok, throw error with text content
      if (!response.ok) {
        throw new Error(textContent || "An error occurred");
      }

      // If response is ok but not JSON, return text content
      return textContent as unknown as T;
    }
  } catch (error) {
    // Re-throw the error with a more specific message
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export default apiFactory;
