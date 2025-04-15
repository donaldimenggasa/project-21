import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation, useLoaderData} from "@remix-run/react";
import { getThemeSession } from "~/server/theme-server";
import { useRef, useState, useEffect } from "react";
import { NonFlashOfWrongThemeEls, ThemeProvider, Theme, useTheme } from "~/providers/theme-provider";
import lodash_fp from "lodash/fp";
import AOS from "aos";
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

const { compose, join, reject, isBoolean, isNil, flatten } = lodash_fp;



import "./tailwind.css";
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const themeSession = await getThemeSession(request);
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  return new Response(
    JSON.stringify({
      theme: themeSession.getTheme(),
    }),
    {
      headers: headers_res,
      status: 200,
    }
  );
};



export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data?.theme}>
      <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
      <GlobalLoading />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
    </ThemeProvider>
    
  );
}

export default function App() {


  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 600,
      easing: "ease-out-sine",
    });
  }, []);
  
  return <Outlet />;
}





const cx = (...args: unknown[]) =>
  compose(join(" "), reject(isBoolean), reject(isNil), flatten)(args);
const GlobalLoading = () => {
  const navigation = useNavigation();
  const active = navigation.state !== "idle";

  const ref = useRef<HTMLDivElement | null>(null);
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    if (active) setAnimationComplete(false);

    Promise.allSettled(
      ref.current
        .getAnimations()
        .map((animation: Animation) => animation.finished)
    ).then(() => !active && setAnimationComplete(true));
  }, [active]);

  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? "Loading" : undefined}
      className="absolute inset-x-0 top-0 left-0 h-1 animate-pulse"
      style={{ zIndex: 9999 }}
    >
      <div
        ref={ref}
        className={cx(
          "h-full bg-linear-to-r from-blue-400 to-cyan-500 transition-all duration-500 ease-in-out",
          navigation.state === "idle" &&
            animationComplete &&
            "w-0 opacity-0 transition-none",
          navigation.state === "submitting" && "w-4/12",
          navigation.state === "loading" && "w-10/12",
          navigation.state === "idle" && !animationComplete && "w-full"
        )}
      />
    </div>
  );
};
