import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { logout } from "~/server/aplikasi-session.server";


export const action = async ({ request, context }: ActionFunctionArgs & {context: { whatsappSocket: { sendMessage: (jid: string, message: { text: string }) => Promise<void>;};};}) => {
   return logout(request);
};

export const loader = async () => redirect("/");



