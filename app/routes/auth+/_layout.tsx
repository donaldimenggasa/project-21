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
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 to-red-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex h-full w-full items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}

/*
export default function Index() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen ">
      <div className="flex h-full w-full items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}*/