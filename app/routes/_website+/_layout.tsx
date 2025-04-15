import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Header from "~/components/layout/website/header";
import Footer from "~/components/layout/website/footer";

export const meta: MetaFunction = () => {
  return [
    { title: "DEO AIRPORT" },
    { name: "description", content: "Welcome to DEO Airport!" },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header/>
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
