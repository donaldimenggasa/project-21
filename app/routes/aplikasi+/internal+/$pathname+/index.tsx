import { useRouteLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { ClientOnly } from "remix-utils/client-only"
import LowcoderAppWrapper from "~/components/LowcoderAppWrapper.client";



export default function InternalDinamicPageIndex() {
    const data = useRouteLoaderData<{ pages?: { x_studio_lowcoder_uuid: string }[] }>("routes/aplikasi+/internal+/$pathname+/_layout");
    const uuid = useMemo(() => {
        const pages = data?.pages || [];
        if (pages.length > 0) {
            return pages[0].x_studio_lowcoder_uuid;
        }
        return null;
    }, [data])

    if (!uuid) {
        return <div>Page not found</div>;
    }

    
    return (
        <ClientOnly fallback={null}>
            {() => {
                return (<YoriLayout appId={uuid} />)
            }}
        </ClientOnly>)
}



function YoriLayout({ appId }: { appId: string }) {
    return (<LowcoderAppWrapper appId={appId} />)
}
