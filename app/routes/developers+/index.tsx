import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { projects, project_pages, ProjectStatus } from "~/server/db/schema/yori_builder";

import { Link, useLoaderData } from '@remix-run/react'
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Header } from "@/components/layout/developers/header";
import { Fragment } from 'react/jsx-runtime';



export const action = async ({ request }: LoaderFunctionArgs) => {
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {
    const body = await request.json();
    let new_project = {}

    await db.transaction(async (tx) => {
      new_project = await tx.insert(projects).values({
        x_name: { en_US: body.x_name },
        x_studio_group: body.x_studio_group,
        pathname: body.pathname,
        x_active: true,
        description: body.description,
        x_studio_status: "DRAFT" as ProjectStatus
      }).returning();

      const index_page = await tx.insert(project_pages).values({
        x_name: { en_US: `${body.x_name} - Home` },
        x_projects_id: new_project[0].id,
        prod_state: {
          //page: {},
          component: {
            root: {
              id: "root",
              //pageId: "page-bYNmnE6",
              parentId: null,
              order: 0,
              type: "div",
              props: {
                className: {
                  order: 2000,
                  section: "style",
                  type: "string",
                  displayName: "CSS Classes",
                  bindable: false,
                  defaultValue: "",
                  value: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full w-full",
                  bindValue: ""
                },
                style: {
                  order: 2001,
                  section: "style",
                  type: "object",
                  displayName: "Inline Styles",
                  bindable: false,
                  defaultValue: {},
                  value: {},
                  bindValue: ""
                },
                hidden: {
                  type: "boolean",
                  defaultValue: false,
                  value: false,
                  displayName: "Hidden",
                  section: "basic",
                  bindable: false,
                  bindValue: "",
                  order: 1000
                },
                loading: {
                  type: "boolean",
                  defaultValue: false,
                  value: false,
                  displayName: "Loading",
                  section: "basic",
                  bindable: false,
                  bindValue: "",
                  order: 1001
                }
              },
              sections: {
                basic: {
                  name: "Basic",
                  order: 0
                },
                style: {
                  name: "Style",
                  order: 1
                },
                binding: {
                  name: "Binding",
                  order: 2
                }
              },
            }
          },
          workflow: {},
          pageAppState: {},
          localStorage: {}
        },
        state: {
          // page: {},
          component: {
            root: {
              id: "root",
              //pageId: "page-bYNmnE6",
              parentId: null,
              order: 0,
              type: "div",
              props: {
                className: {
                  order: 2000,
                  section: "style",
                  type: "string",
                  displayName: "CSS Classes",
                  bindable: false,
                  defaultValue: "",
                  value: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full w-full",
                  bindValue: ""
                },
                style: {
                  order: 2001,
                  section: "style",
                  type: "object",
                  displayName: "Inline Styles",
                  bindable: false,
                  defaultValue: {},
                  value: {},
                  bindValue: ""
                },
                hidden: {
                  type: "boolean",
                  defaultValue: false,
                  value: false,
                  displayName: "Hidden",
                  section: "basic",
                  bindable: false,
                  bindValue: "",
                  order: 1000
                },
                loading: {
                  type: "boolean",
                  defaultValue: false,
                  value: false,
                  displayName: "Loading",
                  section: "basic",
                  bindable: false,
                  bindValue: "",
                  order: 1001
                }
              },
              sections: {
                basic: {
                  name: "Basic",
                  order: 0
                },
                style: {
                  name: "Style",
                  order: 1
                },
                binding: {
                  name: "Binding",
                  order: 2
                }
              },
            }
          },
          workflow: {},
          pageAppState: {},
          localStorage: {}
        },
        //  pathname: body.pathname,
      }).returning();

      await tx.update(projects).set({ x_studio_index_page: index_page[0]?.id })
        .where(eq(projects.id, parseInt(new_project[0].id)));
    });



    return new Response(
      JSON.stringify({
        success: res,
        message: "ok",
      }),
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
              category: {
                name: (project?.x_name as { en_US?: string })?.en_US || 'APLIKASI',
                icon: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />',
                bgColor: "bg-green-100 dark:bg-green-900/20",
                iconColor: "#10b981",
              },
              title: "Aplikasi Management Financial",
              description:
                "Sistem manajemen keuangan untuk pengelolaan anggaran dan pelaporan keuangan.",
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
              links: 3,
              appRoute: "/aplikasi/internal/amc"
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







const AppHomePage = () => {
  const user = null;
  const data = useLoaderData<typeof loader>();



  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <main className="h-[calc(100vh-46px)] overflow-y-auto bg-gray-50 dark:bg-gray-900 mt-16">
        <div className=" bg-gray-50 dark:bg-slate-950 flex flex-row items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-slate-800">
          {data.map((item: any, index: number) => {

            return (<Fragment key={index}>

              <div className="flex flex-col items-start w-1/6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.x_name?.en_US}</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.projects.length} Projects</span>

                {item.projects.map((aplikasi: any, index_: number) => {
                  console.log(aplikasi)
                  return (<Fragment key={index_}>
                    <Link to={`/developers/${aplikasi.pathname}`} className="flex items-center gap-2 mt-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                      {aplikasi.x_name?.en_US}
                    </Link>
                  </Fragment>)
                })}


              </div>



            </Fragment>)
          })}
        </div>
      </main>


    </div>
  );
};

export default AppHomePage;
