"use client";

import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileCompletionModal from "../users/ProfileCompletionModal";

export default function Dashboard() {
  const router = useRouter();
  const { currentUser } = useAuthStore((state) => state);
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <>
    <div className="space-y-4">
      {/* Header with logout button */}
      <div className="flex justify-between items-center p-5">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-4 gap-4 p-5">
        <Card title="Total Projects" />
        <Card title="Open MoMs" />
        <Card title="Approved MoMs" />
        <Card title="Closed MoMs" />
      </div>
    </div>
    {/* Profile completion modal */}
    {currentUser && !currentUser.profile_complete && <ProfileCompletionModal />}
    </>
  );
}