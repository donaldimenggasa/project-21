import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { Outlet, useNavigate, useLocation, useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { ChevronLeft, ChevronRight, LayoutGrid, ChartColumnStacked, Plane, ChartNoAxesCombined, ChartPie, Tag, ChevronDown } from "lucide-react";
import React, { useState, useCallback, Fragment } from "react";
import clsx from "clsx";


export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  const { pathname } = params;
  try {
    const result = await db.query.projects.findFirst({
      with: {
        pages: {
          columns: {
            id: true,
            x_studio_lowcoder_uuid: true,
            x_studio_pathname: true,
            x_name: true,
          },
        },
      },
      where: (projects) => pathname ? eq(projects.pathname, pathname) : undefined,
    });

    /*if (result && result.pages && result.pages.length > 0) {
      console.log(result.pages[0]);
    } else {
      console.log("No pages found or result is undefined.");
    }*/
    return new Response(
      JSON.stringify({
        pages: result?.pages || []
      }),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        pages: [],
        errors: {
          general: "request invalid.",
        },
      }),
      { status: 400, headers: headers_res }
    );
  }
};





export default function InternalDinamicLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const data = useLoaderData<{ pages?: { x_studio_lowcoder_uuid: string }[] }>();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-gray-200 h-12 text-sm">
        <div className=" h-full mx-6 items-center flex justify-between text-center">
          <button
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/aplikasi/internal")}
          >
            <ChevronLeft className="w-4 h-4 " />
            <span className=" font-bold text-sm text-red-600">DEO AIRPORT - SOQ</span>
          </button>
          <span className="font-bold text-sm">APRON MOVEMENT CONTROL</span>
          <span className="font-bold text-sm">UNIT AMC</span>
        </div>
      </header>
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}

