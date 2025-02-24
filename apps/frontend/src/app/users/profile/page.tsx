"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  User,
  Save,
  Loader2,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  UserCircle,
  Mail,
  AtSign,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import apiFactory from "@/factories/apiFactory";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { formatDate } from "@/lib/utils";

// Define the User type based on the API response
type User = {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_complete: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, login, token } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        toast.error("User ID not found");
        return;
      }
      try {
        const userData: any = await apiFactory(
          `${API_ENDPOINTS.USERS.BASE}/${String(currentUser?.id)}`,
          {
            method: "GET",
          }
        );
        console.log("User profile fetched:", userData);
        setUser(userData);
        setFormData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userData: any = await apiFactory(
        `${API_ENDPOINTS.USERS.BASE}/${Number(currentUser?.id)}`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      setUser(userData);
      if (currentUser) {
        login({
          currentUser: {
            ...currentUser,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
          },
          token: token,
        });
      }
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#127285]" />
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (!user) return "U";
    return `${user?.first_name?.charAt(0) || ""}${user?.last_name?.charAt(0) || ""}`;
  };

  return (
    <div className=" bg-gradient-to-b from-white to-gray-50 pt-11 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-[#127285] to-[#1a8fb0] rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-6 py-8 sm:px-8 sm:py-10 flex flex-col sm:flex-row items-center sm:items-start">
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials()}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {user?.first_name} {user?.last_name}
              </h1>
              <div className="mt-2 flex flex-col sm:flex-row items-center sm:items-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  <AtSign className="w-4 h-4 mr-1" />
                  {user?.email}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  <Shield className="w-4 h-4 mr-1" />
                  {user?.role.replace(/_/g, " ")}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user?.is_active
                      ? "bg-green-500/20 text-green-50"
                      : "bg-red-500/20 text-red-50"
                  }`}
                >
                  {user?.is_active ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {user?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center border-b border-gray-200 pb-3">
                  <UserCircle className="w-5 h-5 mr-2 text-[#127285]" />
                  Personal Information
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-1">
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#127285] focus:border-transparent transition-all"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#127285] focus:border-transparent transition-all"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#127285] focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center border-b border-gray-200 pb-3">
                  <Shield className="w-5 h-5 mr-2 text-[#127285]" />
                  Account Details
                </h2>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase mb-1">
                      User ID
                    </span>
                    <span className="text-gray-900 font-medium flex items-center">
                      <User className="w-4 h-4 mr-1 text-[#127285]" />
                      {user?.id}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase mb-1">
                      Profile Status
                    </span>
                    <span
                      className={`font-medium flex items-center ${
                        user?.profile_complete
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {user?.profile_complete ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <Clock className="w-4 h-4 mr-1" />
                      )}
                      {user?.profile_complete ? "Complete" : "Incomplete"}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase mb-1">
                      Account Role
                    </span>
                    <span className="text-[#127285] font-medium flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      {user?.role.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 flex flex-row justify-between md:col-span-3 lg:col-span-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Created At
                      </span>
                      <span className="text-gray-900 font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-[#127285]" />
                        {formatDate(user?.created_at as string)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs  font-medium text-gray-500 uppercase mb-1">
                        Last Updated
                      </span>
                      <span className="text-gray-900 font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-[#127285]" />
                        {formatDate(user?.updated_at as string)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-white bg-[#127285] border border-transparent rounded-lg shadow-sm hover:bg-[#0e5a6a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#127285] disabled:opacity-70 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
