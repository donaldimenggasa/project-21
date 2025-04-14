import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { projects } from "~/server/db/schema/yori_builder";
import { useEffect, useState, useRef, Fragment } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { TopNavbar } from "~/components/TopNavbar";
import { LeftSidebar } from "~/components/LeftSidebar";
import { RightSidebar } from "~/components/RightSidebar";
import { type LoaderFunctionArgs } from "@remix-run/node";
import MainContent from "~/components/MainContent";
import { BottomPanel } from "~/components/BottomPanel";
import { ResizeHandle } from "~/components/ResizeHandle";
import { useStore, initializeInactivityBackup } from "~/store/zustand/store";
import { useLoaderData } from "@remix-run/react";
import { WorkflowExecutor } from '~/lib/workflow-executor';



export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { project_path } = params;
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {
    const result = await db.query.projects.findFirst({
      with: {
        index_page: {
          columns: {
            state: true,
            id: true,
          },
        },
        pages: {
          columns: {
            id: true,
            x_name: true,
          },
        },
      },
      where: project_path ? eq(projects.pathname, project_path) : undefined,
    });

    return new Response(
      JSON.stringify({
        schema: result?.index_page?.state,
        pageId: result?.index_page?.id,
        pages: result?.pages,
        pathname: result?.pathname,
        id: result?.id,
        name: result?.x_name,
      }),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    console.log(e);
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

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const data = useLoaderData<{
    schema?: string;
    pages?: Array<{ id: string; x_name: string }>;
    pathname?: string;
    pageId?: number;
    id?: string;
    name?: string;
  }>();
  console.log(data.schema);

  const {
    showLeftPanel,
    showRightPanel,
    showBottomPanel,
    page,
    selectedPage,
    uploadState,
    setActiveTab,
    isDarkMode,
    toggleDarkMode,
  } = useStore();

  useEffect(() => {
    try {
      if (data.schema) {
        uploadState(data.schema);
        setIsLoading(() => false);
        initializeInactivityBackup(
          data.id ? parseInt(data.id, 10) : 0,
          data?.pageId
        );
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  console.log(data);

  return (
    <Fragment>
      {!data?.schema || isLoading ? (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading application...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen ">
          <TopNavbar />

          <PanelGroup direction="vertical" className="h-full">
            <Panel defaultSize={96}>
              <div className="flex flex-1 overflow-hidden h-full">
                {showLeftPanel && <LeftSidebar />}
                <MainContent />
                {showRightPanel && <RightSidebar />}
              </div>
            </Panel>
            <ResizeHandle
              orientation="horizontal"
              style={{ display: showBottomPanel ? "flex" : "none" }}
            />
            <Panel
              minSize={showBottomPanel ? 4 : 0}
              defaultSize={showBottomPanel ? 4 : 0}
              style={{ display: showBottomPanel ? "block" : "none" }}
            >
              <BottomPanel />
            </Panel>
          </PanelGroup>
        </div>
      )}
    </Fragment>
  );
}

export default App;
