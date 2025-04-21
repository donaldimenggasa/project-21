import { MetaFunction, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLocation } from "@remix-run/react";
import { Header } from "@/components/layout/aplikasi-internal/header";


export const meta: MetaFunction = () => {
  return [
    { title: "INTERNAL - DEO AIRPORT" },
    { name: "description", content: "Welcome to DEO Airport!" },
  ];
};




export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { current_user } = context;
  if (!current_user) {
    return redirect("/auth/login/internal");
  }
  return null;
};



export default function Index() {
  const { pathname } = useLocation();

  if (pathname === "/aplikasi/internal") {
    return (
      <div className="h-screen overflow-hidden">
        <div className="flex h-full">
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    )

  }

  return (
    <Outlet />
  );
}
