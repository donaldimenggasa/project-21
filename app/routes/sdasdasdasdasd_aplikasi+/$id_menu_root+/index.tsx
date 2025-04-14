import { db } from "~/server/db";
import { eq, sql } from "drizzle-orm";
import getView from "~/server/get-odoo-view";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";


export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id_menu_root } = params;
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {

    const result = await db.query.menus.findFirst({
      where: (menus) => id_menu_root ? eq(menus.id, parseInt(id_menu_root ?? "0")) : undefined,
    });
    const listView = await getView('x_mobile_devices');
    return new Response(
      JSON.stringify({ ...listView }),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        errors: {
          general: "request invalid.",
        },
      }),
      { status: 400, headers: headers_res }
    );
  }
};





export default () =>{
    const data = useLoaderData();
   
      return (<div>INDEX</div>)
}