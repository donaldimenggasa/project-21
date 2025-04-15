import { db } from '~/server/db';
import { eq, sql, isNull, and, isNotNull, not, inArray } from "drizzle-orm";
import { type LoaderFunctionArgs } from "@remix-run/node";


export const loader = async ({ request }: LoaderFunctionArgs) => {
    const headers_res = new Headers();
    headers_res.set("Content-Type", "application/json");
    try{
        const result = await db.query.menus.findMany({
            where: (menus) => and(
                isNull(menus.parent_id),
                //isNotNull(menus.action),
                not(inArray(menus.id, [
                    1, // SETTINGS,
                    15, // APPS
                    293, // LIVE CHAT
                    1374, // PUBLIC ATTACVHMENT
                    74, // DISCUS
                    1279, // EMAI MARKETING
                    16, // TEST 
                    1110, // DATA CLEANING
                    230, // LINK TRACKER
                ]))
              ),
            orderBy: (menus) => [menus.sequence],
            columns: {
                id: true,
                name: true,
                sequence : true,
                action : true,
                parent_id : true,
               
              },
          });
        return new Response(
            JSON.stringify(result),
            { status: 200, headers: headers_res }
          );
    }catch(e){
        return new Response(
            JSON.stringify({
                errors: {
                    general: "request invalid."
                },
            }),
            {status: 400, headers: headers_res});
    }
}

import { Menu, Bell, MessageSquare, User, Search } from 'lucide-react';
import AppGrid from '~/components/AppGrid';
import { useLoaderData } from '@remix-run/react';




const Header = () => {
    return (
        <header className="bg-white shadow-xs sticky top-0 z-50">
            <div className="container mx-auto">
                <div className="flex justify-between items-center h-16 px-6">
                    <div className="flex items-center gap-6">
                        <Menu className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" />
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-2 cursor-pointer">
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">YORI G SARAPIL</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};






export default function Index() {
    const data = useLoaderData<typeof loader>();
    return (<div className="min-h-screen bg-linear-to-br from-[#f1f1ff] to-[#e8e8ff]">
        <Header />
        <main className="container mx-auto px-6 py-8">
            <AppGrid menu={data}/>
        </main>

    </div>)
}