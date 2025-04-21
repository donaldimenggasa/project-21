
import { Outlet, useLoaderData } from '@remix-run/react'
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {
    const users = {}
    return new Response(JSON.stringify(users),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
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

  return (<Outlet />);
};

