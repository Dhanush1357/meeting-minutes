"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, ChevronDown, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import companyLogo from "../../../public/logo/activus-full.svg";
import { useRouter, usePathname } from "next/navigation";
import Notifications from "../Notifications";

type Role = "SUPER_ADMIN" | "public";

const routes = {
  public: [{ name: "Projects", href: "/projects" }],
  SUPER_ADMIN: [{ name: "Users", href: "/users" }],
};

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-menu")) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
      if (routes[role]) {
        links.push(...routes[role]);
      }
    }
    return links;
  }, [isAuthenticated, currentUser?.role]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${isScrolled ? "bg-[#127285] shadow-md" : "bg-[#127285]"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                priority
                src={companyLogo}
                alt="Activus Logo"
                className="w-28 h-auto sm:w-32 md:w-40 transition-all duration-300"
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${
                      pathname === link.href
                        ? isScrolled
                          ? "text-[#127285] bg-blue-50"
                          : "text-white bg-[#0e5a6a]"
                        : isScrolled
                          ? "text-gray-700 hover:text-[#127285] hover:bg-blue-50"
                          : "text-white/90 hover:text-white hover:bg-[#0e5a6a]"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Profile Dropdown - Only show if authenticated */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2 ml-4">
                  <Notifications />
                  <div className="relative profile-menu">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileOpen(!isProfileOpen);
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200
                ${
                  isScrolled
                    ? "text-gray-700 hover:text-[#127285] hover:bg-blue-50"
                    : "text-white hover:bg-[#0e5a6a]"
                }`}
                    >
                      <User className="w-5 h-5 text-white" />
                      <span className="hidden sm:block text-sm font-medium">
                        {currentUser?.first_name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-in fade-in-50 slide-in-from-top-5">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm text-[#2D3748]">
                            {currentUser?.first_name} {currentUser?.last_name}
                          </p>
                          <p className="text-xs text-[#4A5568]">
                            {currentUser?.email}
                          </p>
                          <span className="inline-block mt-1 text-xs font-medium text-[#127285] bg-blue-50 px-2 py-0.5 rounded">
                            {currentUser?.role?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Profile Settings
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-md transition-colors duration-200
              ${
                isScrolled
                  ? "text-gray-700 hover:text-[#127285] hover:bg-blue-50"
                  : "text-white hover:bg-[#0e5a6a]"
              }`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top">
            <div className="px-4 py-3 border-b border-gray-100">
              {isAuthenticated && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.first_name} {currentUser?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentUser?.email}
                      </p>
                    </div>
                    <Notifications />
                  </div>
                  <span className="inline-block mt-2 text-xs font-medium text-[#127285] bg-blue-50 px-2 py-0.5 rounded">
                    {currentUser?.role?.replace(/_/g, " ")}
                  </span>
                </>
              )}
            </div>

            <div className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium transition-colors duration-200
                   ${
                     pathname === link.href
                       ? "text-[#127285] bg-blue-50"
                       : "text-gray-700 hover:text-[#127285] hover:bg-gray-50"
                   }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            {isAuthenticated && (
              <div className="border-t border-gray-100 py-2">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
