import { type LoaderFunctionArgs } from "@remix-run/node";
import axios from "axios";

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const { id_module, nama_module } = params;
 // const { current_user } = context as {
 //   current_user: { LOWCODER_CE_SELFHOST_TOKEN: string };
  //};

  try {
    const { data } = await axios({
      method: "GET",
      url: `${process.env.LOWCODER_PROTOCOL}//${process.env.LOWCODER_HOST}:${process.env.LOWCODER_PORT}/api/npm/package/${id_module}/lowcoder-comps@latest/${nama_module}.js`,
      //headers: {
       // "Content-Type": "application/json",
     //   "Cookie": `LOWCODER_CE_SELFHOST_TOKEN=${current_user.LOWCODER_CE_SELFHOST_TOKEN};`,
      //},
      responseType: "text", // ⬅ penting untuk file JS
    });

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript;charset=UTF-8",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      `console.error("model not found");`,
      {
        status: 400,
        headers: {
          "Content-Type": "application/javascript;charset=UTF-8",
        },
      }
    );
  }
};
