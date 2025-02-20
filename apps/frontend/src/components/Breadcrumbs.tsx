"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbMap: { [key: string]: string } = {
    projects: "Projects",
    mom: "Minutes of Meeting",
    users: "Users",
  };

  return (
    <nav className="text-sm text-gray-500">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/projects" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          let href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const label = breadcrumbMap[segment] || segment.replace(/-/g, " ");

          // Redirect "MoM" breadcrumb to `/projects/[id]`
          if (segment === "mom" && pathSegments[index - 1]) {
            href = `/projects/${pathSegments[index - 1]}`;
          }

          return (
            <li key={`${href}-${index}`} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              {isLast ? (
                <span className="text-gray-700 font-medium">{label}</span>
              ) : (
                <Link href={href} className="text-gray-700 hover:text-gray-900">
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
