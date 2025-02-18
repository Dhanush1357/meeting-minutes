"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import companyLogo from "../../../public/logo/activus-full.svg";
import { useRouter } from "next/navigation";


type Role = "SUPER_ADMIN" | "public";

const routes = {
  public: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Projects", href: "/projects" },
  ],
  SUPER_ADMIN: [{ name: "Users", href: "/users" }],
};

const Navbar = () => {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // Memoize navigation links based on authentication and role
  const navLinks = useMemo(() => {
    const links = [];
    if (isAuthenticated) {
      links.push(...routes.public);
      const role = currentUser?.role as Role;
      console.log("role===========",currentUser);
      if (routes[role]) {
        links.push(...routes[role]);
      }
    }
    return links;
  }, [isAuthenticated, currentUser?.role]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#127285] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                priority
                src={companyLogo}
                alt="Activus Logo"
                className="w-28 h-auto sm:w-32 md:w-40 lg:w-48 xl:w-56" 
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-secondary-200 transition"
                >
                  {link.name}
                </Link>
              ))}

              {/* Profile Dropdown - Only show if authenticated */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full border border-[#E2E8F0] hover:bg-primary-300 transition"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-md shadow-lg">
                      <div className="px-4 py-2 border-b border-[#E2E8F0]">
                        <p className="text-sm text-[#2D3748]">
                          {currentUser?.first_name} {currentUser?.last_name}
                        </p>
                        <p className="text-xs text-[#4A5568]">{currentUser?.email}</p>
                        <p className="text-xs text-[#127285] mt-1 font-medium">
                          {currentUser?.role?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <Link href="/profile">
                        <span className="flex items-center px-4 py-2 text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </span>
                      </Link>
                      <button
                        onClick={() => handleLogout()}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-[#F7FAFC]"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-[#2D3748]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#2D3748]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E2E8F0]">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-[#2D3748] hover:bg-[#F7FAFC] transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="px-4 py-2 border-t border-[#E2E8F0]">
                  <p className="text-sm text-[#2D3748]">
                    {currentUser?.first_name} {currentUser?.last_name}
                  </p>
                  <p className="text-xs text-[#4A5568]">
                    {currentUser?.role?.replace(/_/g, " ")}
                  </p>
                </div>
                <Link href="/profile">
                  <span className="block px-4 py-3 text-[#2D3748] hover:bg-[#F7FAFC]">
                    Profile
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-[#F7FAFC]"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
