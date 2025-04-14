import { db } from "~/server/db";
import { eq, sql } from "drizzle-orm";
import { project_pages } from "~/server/db/schema/yori_builder";
import { type LoaderFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: LoaderFunctionArgs) => {
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {
    const data = await request.json();
    console.log(data);
    await db.transaction(async (tx) => {
      await tx
        .update(project_pages)
        .set({ state: data.state })
        .where(eq(project_pages.id, parseInt(data.pageId)));
    });

    return new Response(
      JSON.stringify({
        success: true
      }),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        errors: {
          general: "periode posko telah berakhir.",
        },
      }),
      { status: 400, headers: headers_res }
    );
  }
};
