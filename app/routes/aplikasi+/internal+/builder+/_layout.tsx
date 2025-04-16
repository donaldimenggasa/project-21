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
    { title: "BUILDER - DEO AIRPORT" },
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
     <Outlet/>
  </div>
  );
}
