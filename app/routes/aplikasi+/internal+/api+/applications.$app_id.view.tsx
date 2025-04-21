import { type LoaderFunctionArgs } from "@remix-run/node";
import axios from "axios";

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
    const { app_id } = params;
    const headers_res = new Headers();
    headers_res.set("Content-Type", "application/json");
    const { current_user } = context as { current_user: { LOWCODER_CE_SELFHOST_TOKEN: string } };
    try {
        const { data } = await axios({
            method: "GET",
            url: `${process.env.LOWCODER_PROTOCOL}//${process.env.LOWCODER_HOST}:${process.env.LOWCODER_PORT}/api/applications/${app_id}/view`,
            headers:{
                "Content-Type": "application/json",
                "Cookie": `LOWCODER_CE_SELFHOST_TOKEN=${current_user.LOWCODER_CE_SELFHOST_TOKEN};`
            }
        });
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: headers_res,
        });
    } catch (e) {
        console.log(e)
        return new Response(
            JSON.stringify({
                error: true,
                data: null,
                message: "model not found",
            }),
            { status: 400, headers: headers_res }
        );
    }
};