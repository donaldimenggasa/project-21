import {
  MetaFunction,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getAuthSession } from "~/server/aplikasi-session.server";
import { Outlet } from "@remix-run/react";
import { Header } from "@/components/layout/aplikasi-internal/header";
import { Toaster } from "@/components/ui/toaster";



export const meta: MetaFunction = () => {
  return [
    { title: "INTERNAL - DEO AIRPORT" },
    { name: "description", content: "Welcome to DEO Airport!" },
  ];
};


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authSession = await getAuthSession(request);
  await authSession.requiredLogin();
  return null;
};


export default function Index() {
  return (
    <div className="h-screen overflow-hidden">
    <div className="flex h-full">
      {/*showSidebar && (
        <div className="hidden md:flex md:w-64 md:flex-col">
          <Sidebar />
        </div>
      )*/}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 mt-12 ">
          <Outlet/>
        </main>
      </div>
    </div>
  </div>
  );
}
