import type { MetaFunction } from "@remix-run/node";
import { Outlet, useLocation } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "INTERNAL - DEO AIRPORT" },
    { name: "description", content: "Welcome to DEO Airport!" },
  ];
};

export default function Index() {
  const { pathname } = useLocation();
  const showSidebar = pathname.startsWith("/aplikasi/internal/amc");
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        {showSidebar && (
          <div className="hidden md:flex md:w-64 md:flex-col">
            {/** <Sidebar /> */}
          </div>
        )}
        <div className="flex flex-1 flex-col">
          {/**<Header /> */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 mt-12 ">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
