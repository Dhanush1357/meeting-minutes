"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home  } from "lucide-react";

const Breadcrumbs = () => {
  const pathname = usePathname();

  // Routes where breadcrumbs should be hidden
  const hiddenRoutes = ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/public", "/favicon.ico", "/manifest.json"];

  // If current route is in hiddenRoutes, don't show breadcrumbs
  if (hiddenRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbMap: { [key: string]: string } = {
    projects: "Projects",
    mom: "Minutes of Meeting",
    users: "Users",
  };

  // Function to capitalize and format segment
  const formatSegment = (segment: string) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to get segment label
  const getSegmentLabel = (segment: string) => {
    return breadcrumbMap[segment] || formatSegment(segment);
  };

  return (
    <nav aria-label="Breadcrumb" className="flex-1 md:px-2">
      <ol className="flex items-center space-x-1 md:space-x-2 overflow-x-auto whitespace-nowrap py-1 scrollbar-hide">
        <li className="flex items-center min-w-fit">
          <Link
            href="/projects"
            className="text-gray-500 hover:text-[#127285] transition-colors duration-200 flex items-center gap-1 text-sm"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          let href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const label = getSegmentLabel(segment);

          // Redirect "MoM" breadcrumb to `/projects/[id]`
          if (segment === "mom" && pathSegments[index - 1]) {
            href = `/projects/${pathSegments[index - 1]}`;
          }

          return (
            <li
              key={`${href}-${index}`}
              className="flex items-center min-w-fit"
            >
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
              {isLast ? (
                <span className="ml-1 md:ml-2 text-sm font-medium text-[#127285]">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="ml-1 md:ml-2 text-sm text-gray-500 hover:text-[#127285] transition-colors duration-200"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
