import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { CurrentUserType } from "@/app/users/types";

interface AuthState {
  currentUser: null | CurrentUserType;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: {
    currentUser:CurrentUserType;
    token: string | null;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      login: (userData) => {
        set({
          currentUser: userData.currentUser,
          token: userData.token,
          isAuthenticated: true,
        });
        Cookies.set("auth-storage", JSON.stringify({ state: { isAuthenticated: true } }), {
          expires: 7,
          path: "/",
        });
      },
      logout: () => {
        set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
        });
        Cookies.remove("auth-storage");
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
