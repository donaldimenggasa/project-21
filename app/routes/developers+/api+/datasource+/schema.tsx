import { db } from '~/server/db';
import { type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers_res = new Headers();
    headers_res.set("Content-Type", "application/json");
    try{
        const result = await db.query.models.findMany({
            with: {
                fields : true,
            },
        });
        return new Response(
            JSON.stringify(result),
            { status: 200, headers: headers_res }
          );
    }catch(e){
        console.log(e)
        return new Response(
            JSON.stringify({
                errors: {
                    general: "request invalid."
                },
            }),
            {status: 400, headers: headers_res});
    }
}