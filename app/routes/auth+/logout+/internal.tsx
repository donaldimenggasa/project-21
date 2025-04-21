import { type ActionFunctionArgs, redirect } from "@remix-run/node";
//import { redis } from "~/server/redis-db.server.js";


export const action = async ({ request, context }: ActionFunctionArgs & {context: { whatsappSocket: { sendMessage: (jid: string, message: { text: string }) => Promise<void>;}; sessionStorage: { getSession: (cookie: string | null) => Promise<any>; destroySession: (session: any) => Promise<string>; }; };}) => {
   const { sessionStorage } = context;
   const session = await sessionStorage.getSession(request.headers.get("Cookie"));
   return redirect("/", {
       headers: {
         "Set-Cookie": await sessionStorage.destroySession(session),
       },
     });
};

export const loader = async () => redirect("/");



