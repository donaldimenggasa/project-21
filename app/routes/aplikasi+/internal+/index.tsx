
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { projects, project_pages, ProjectStatus } from "~/server/db/schema/yori_builder";
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from '@remix-run/react'
import { Button } from "@/components/ui/button";
import {  ChevronRight, Plus, Edit, Ellipsis, Grid } from "lucide-react";
import { Badge } from "@/components/ui/badge";



type AvatarType = {
  initials: string;
  color: string;
};

type UserNeedType = {
  id: string;
  category: {
    name: string;
    icon: string;
    bgColor: string;
    iconColor: string;
  };
  title: string;
  description: string;
  status: {
    label: string;
    bgColor: string;
    textColor: string;
    variant?: string;
  };
  comments: number;
  stars: number;
  avatars: AvatarType[];
  links: number;
  alert?: boolean;
  borderColor?: string;
  appRoute?: string;
};





export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {
    const result = await db.query.project_groups.findMany({
      with: {
        projects: true
      }
    });
    return new Response(
      JSON.stringify(result.map((item) => {
        return {
          ...item,
          projects: item.projects.map((project) => {
            return {
              ...project,
              status: {
                label: "ACTIVE",
                bgColor: "bg-green-100 dark:bg-green-800",
                textColor: "text-green-800 dark:text-green-200",
                variant: "outline",
              },
              comments: 5,
              stars: 4,
              avatars: [
                { initials: "JD", color: "bg-orange-500" },
                { initials: "KL", color: "bg-blue-500" },
                { initials: "MN", color: "bg-green-500" },
              ],
              links: 3
            }
          })

        }
      })),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    console.log(e)
    return new Response(
      JSON.stringify({
        errors: {
          general: "request invalid."
        },
      }),
      { status: 400, headers: headers_res });
  }
}






export default  () => {
  const user = null;
  const data = useLoaderData<typeof loader>();
  console.log(data)

  const CommentCount = ({ count }: { count: number }) => (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span className="text-xs ml-1">{count}</span>
    </div>
  );

  // Component to render star count
  const StarCount = ({ count }: { count: number }) => (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="text-xs ml-1">{count}</span>
    </div>
  );


  // Component to render avatar list
  const AvatarList = ({ avatars }: { avatars: AvatarType[] }) => (
    <div className="flex -space-x-2 overflow-hidden">
      {avatars.map((avatar, index) => {
        return (
          <div
            key={index}
            className={`w-6 h-6 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs ring-2 ring-white dark:ring-slate-900`}
          >
            {avatar.initials}
          </div>
        )
      })}
    </div>
  );




  // Component to render a user need card
  const UserNeedCard = ({ project }: { project: any }) => {
    console.log(project);

    return (
      <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md mb-4 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center mb-2">
            <Grid className=' h-5 w-5 font-bold mr-2  text-green-600'/>
            <span className="text-sm font-medium text-gray-700">{project?.x_name?.en_US}</span>
            <button className="ml-auto text-xs text-gray-500 bg-amber-200 p-1 rounded cursor-pointer hover:bg-amber-300">
            <Ellipsis className=' h-4 w-4'/>
            </button>
          </div>
          <h3 className="text-sm font-medium mb-2">{project.description}</h3>
          <p className="text-xs text-gray-500 mb-2">{project.description_2}</p>
          <div className="flex items-center justify-between">
            <Badge
              //variant={need.status.variant}
              className={`text-xs bg-red-400 hover:bg-red-500 cursor-pointer`}
            >
              {project.status?.label}
            </Badge>
            <div className="flex items-center gap-2">
              {project?.comments && <CommentCount count={project?.comments} />}
              {project?.stars && <StarCount count={project?.stars} />}
              {project?.avatars && <AvatarList avatars={project?.avatars} />}
            </div>
          </div>
        </div>
  
        <div className="border-t border-gray-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
          <Link to={`/developers/${project.pathname}`} className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 flex flex-row items-center text-white rounded">      
            <Edit className=' h-4 w-4 mr-2' />
              EDIT APP
            </Link>
            <Link
              to={`/aplikasi/internal/${project?.pathname}`}
              className="h-7 px-2 text-xs bg-green-800 hover:bg-green-900 flex flex-row items-center text-white rounded">
              GO TO APP
              <ChevronRight className=' h-4 w-4'/>
            </Link>
        </div>
      </div>
    )
  }




  return (
    <div className="h-full bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col md:flex-row h-[calc(100vh-50px)] overflow-hidden">
        {data.map((item: any, index: number) => {
          return (<div key={index} className="w-full md:w-3/12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-800 p-4 h-14">
              <h2 className="text-sm font-semibold">{item.x_name?.en_US}</h2>
              <Button size="icon" variant="ghost" className=" hover:bg-gray-200 cursor-pointer">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
              {item.projects?.map((project: any, _index: number) => (
                <UserNeedCard key={_index} project={project} />
              ))}
            </div>
          </div>)
        })}
      </div>
    </div>
  );
};


