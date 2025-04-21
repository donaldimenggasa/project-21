import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { ClientOnly } from "remix-utils/client-only"
import LowcoderAppWrapper from "~/components/LowcoderAppWrapper.client";


export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const headers_res = new Headers();
    headers_res.set("Content-Type", "application/json");
    const { current_user } = context as { current_user: { LOWCODER_CE_SELFHOST_TOKEN: string } };
    try {
        const { data :{ data } } = await axios({
            method: "GET",
            url: `${process.env.LOWCODER_PROTOCOL}//${process.env.LOWCODER_HOST}:${process.env.LOWCODER_PORT}/api/applications/6801f92e16b756579000e667/view`,
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



const YoriLayout = () => {
   
    return (<div>
        sdasdasas asdas
    <LowcoderAppWrapper 
        appId={"68033a15daf6c6327fb42541"}
    />
      </div>)
}


const Yori = () =>{
    return (<ClientOnly fallback={null}>
        {()=>{
            return (<YoriLayout/>)
        }}
    </ClientOnly>)
}


export default Yori;